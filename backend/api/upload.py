import os
import tempfile
import structlog
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database.connection import get_db, DATABASE_URL
from database.models import Dataset
from services.data_processing import process_csv, bulk_insert_to_postgres, process_large_csv_background

logger = structlog.get_logger(__name__)
router = APIRouter()

MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

@router.post("/api/upload")
async def upload_csv(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    # Read first chunk to check size or read entirely and check size
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail={"message": "The uploaded CSV exceeds the 100MB capacity limit. Please compress or trim your dataset.", "code": "FILE_TOO_LARGE"})
        
    dataset = Dataset(original_filename=file.filename, filename=file.filename, status="processing")
    db.add(dataset)
    await db.commit()
    await db.refresh(dataset)
    
    # Save file to a temporary location
    temp_dir = tempfile.gettempdir()
    file_path = os.path.join(temp_dir, f"{dataset.id}.csv")
    
    with open(file_path, "wb") as f:
        # Read in chunks and write
        while chunk := file.file.read(1024 * 1024):  # 1MB chunks
            f.write(chunk)
            
    # For smaller files, we could do it synchronously, but since DuckDB 
    # and Postgres copy takes some IO, we offload to background task to avoid blocking the API loop.
    logger.info("upload.scheduled", dataset_id=dataset.id, size=file_size)
    background_tasks.add_task(process_large_csv_background, file_path, dataset.id, DATABASE_URL, db)
    
    return {
        "success": True,
        "code": "UPLOAD_SUCCESS",
        "message": "File uploaded successfully! Background processing initiated.",
        "dataset_id": dataset.id
    }
