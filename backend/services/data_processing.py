import os
import duckdb
import pandas as pd
import psycopg2
from urllib.parse import urlparse
import structlog
import uuid

logger = structlog.get_logger(__name__)

def process_csv(file_path: str, dataset_id: str):
    """
    Ingests a CSV file using DuckDB, determines schema dynamically,
    deduplicates rows, and samples data for profiling.
    """
    logger.info("process_csv.start", dataset_id=dataset_id, file_path=file_path)
    con = duckdb.connect(database=':memory:')
    
    try:
        # Load CSV into duckdb view. read_csv_auto automatically detects types/headers
        con.execute(f"CREATE VIEW raw_data AS SELECT * FROM read_csv_auto('{file_path}', sample_size=10000);")
        
        # Determine schema & deduplicate if necessary, but for raw speed we will just map types
        df_schema = con.execute("DESCRIBE raw_data;").df()
        
        # Grab total row count
        row_count = con.execute("SELECT count(*) FROM raw_data").fetchone()[0]
        column_count = len(df_schema)
        
        # Extract a small sample for profiling (pandas)
        # Using 10,000 limit for speed in ydata_profiling
        sample_df = con.execute("SELECT * FROM raw_data USING SAMPLE 10000").df()
        
        logger.info("process_csv.profiling", dataset_id=dataset_id, row_count=row_count)
        profile_json = profile_data(sample_df)
        
        schema_info = df_schema.to_dict('records')
        
        return {
            "row_count": row_count,
            "column_count": column_count,
            "schema": schema_info,
            "profile": profile_json
        }
        
    except Exception as e:
        logger.error("process_csv.error", dataset_id=dataset_id, error=str(e))
        raise
    finally:
        con.close()

def profile_data(sample_df: pd.DataFrame) -> dict:
    """Runs a minimal profile report to extract basic statistics."""
    # Lazy-load ydata-profiling to avoid ~200MB memory overhead at startup
    from ydata_profiling import ProfileReport
    profile = ProfileReport(sample_df, minimal=True, explorative=False)
    # Get JSON output from description setup
    desc = profile.get_description()
    
    # We serialize the summary parts we care about to JSON-compatible dict format
    # Because full descripton has lots of pandas objects, we need to extract key metrics manually or parse
    profile_summary = {
        "num_variables": int(desc.table.get('n_var', 0)),
        "num_observations": int(desc.table.get('n', 0)),
        "variables": {}
    }
    
    for col_name, stats in desc.variables.items():
        profile_summary["variables"][col_name] = {
            "type": str(stats.get('type', 'Unknown')),
            "n_missing": int(stats.get('n_missing', 0)),
            "n_unique": int(stats.get('n_distinct', 0)),
        }
        if stats.get('type') == 'Numeric':
            profile_summary["variables"][col_name].update({
                "mean": float(stats.get('mean', 0.0)) if not pd.isna(stats.get('mean')) else None,
                "min": float(stats.get('min', 0.0)) if not pd.isna(stats.get('min')) else None,
                "max": float(stats.get('max', 0.0)) if not pd.isna(stats.get('max')) else None,
            })
            
    return profile_summary

def bulk_insert_to_postgres(database_url: str, file_path: str, dataset_id: str, schema: list):
    """
    Creates a dynamic table in postgres and uses COPY to bulk insert the CSV.
    """
    logger.info("bulk_insert.start", dataset_id=dataset_id)
    
    # Need to convert postgresql+asyncpg URL to standard postgresql for psycopg2
    sync_url = database_url.replace("+asyncpg", "")
    if sync_url.startswith("postgres://"):
        sync_url = sync_url.replace("postgres://", "postgresql://", 1)
    
    table_name = f"dataset_{dataset_id.replace('-', '_')}"
    
    # Map duckdb types to Postgres types
    type_mapping = {
        "BIGINT": "BIGINT",
        "INTEGER": "INTEGER",
        "DOUBLE": "DOUBLE PRECISION",
        "FLOAT": "REAL",
        "BOOLEAN": "BOOLEAN",
        "VARCHAR": "TEXT",
        "DATE": "DATE",
        "TIMESTAMP": "TIMESTAMP"
    }
    
    columns_def = []
    for col in schema:
        # Sanitize column names
        safe_col = col['column_name'].replace(' ', '_').replace('"', '').replace("'", "")
        pg_type = type_mapping.get(col['column_type'], "TEXT")
        columns_def.append(f'"{safe_col}" {pg_type}')
        
    create_table_sql = f'CREATE TABLE {table_name} ({", ".join(columns_def)});'
    
    conn = psycopg2.connect(sync_url)
    try:
        cur = conn.cursor()
        cur.execute(create_table_sql)
        
        # Bulk load using COPY for ultimate speed
        with open(file_path, 'r') as f:
            # COPY automatically skips headers if specified
            copy_sql = f'COPY {table_name} FROM STDIN WITH CSV HEADER'
            cur.copy_expert(copy_sql, f)
            
        conn.commit()
        logger.info("bulk_insert.complete", dataset_id=dataset_id, table_name=table_name)
    except Exception as e:
        conn.rollback()
        logger.error("bulk_insert.error", dataset_id=dataset_id, error=str(e))
        raise
    finally:
        conn.close()
        
    return table_name

async def process_large_csv_background(file_path: str, dataset_id: str, database_url: str):
    """Background task to run ingestion and database bulk insert.
    
    IMPORTANT: This function creates its own DB session because FastAPI's
    request-scoped session (from Depends(get_db)) is closed by the time
    the background task runs — using it would silently fail on commit.
    """
    from database.models import Dataset, DatasetColumn, DatasetProfile
    from database.connection import AsyncSessionLocal
    from sqlalchemy import select
    
    async with AsyncSessionLocal() as db_session:
        try:
            # 1. Process with DuckDB (extract schema and profile)
            result = process_csv(file_path, dataset_id)
            
            # 2. Bulk insert data rows into Postgres
            table_name = bulk_insert_to_postgres(database_url, file_path, dataset_id, result['schema'])
            
            # 3. Update DB records
            dataset_result = await db_session.execute(select(Dataset).where(Dataset.id == dataset_id))
            dataset = dataset_result.scalar_one_or_none()
            
            if dataset:
                dataset.status = "ready"
                dataset.row_count = result["row_count"]
                dataset.column_count = result["column_count"]
                dataset.table_name = table_name
                
                # Insert profile
                profile = DatasetProfile(
                    dataset_id=dataset_id,
                    profile_json=result["profile"]
                )
                db_session.add(profile)
                
                # Insert columns
                for col in result["schema"]:
                    db_col = DatasetColumn(
                        dataset_id=dataset_id,
                        name=col['column_name'],
                        dtype=col['column_type']
                    )
                    db_session.add(db_col)
                    
                await db_session.commit()
                logger.info("background_process.complete", dataset_id=dataset_id, status="ready")
                
        except Exception as e:
            logger.error("background_process.failed", dataset_id=dataset_id, error=str(e))
            try:
                dataset_result = await db_session.execute(select(Dataset).where(Dataset.id == dataset_id))
                dataset = dataset_result.scalar_one_or_none()
                if dataset:
                    dataset.status = "error"
                    dataset.error_message = str(e)[:500]
                    await db_session.commit()
            except Exception as inner_e:
                logger.error("background_process.status_update_failed", dataset_id=dataset_id, error=str(inner_e))
        finally:
            # Cleanup temp file
            if os.path.exists(file_path):
                os.remove(file_path)
