import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, JSON, ForeignKey, BigInteger
from sqlalchemy.orm import declarative_base

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, default=generate_uuid)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    status = Column(String, default="processing")  # processing, ready, error
    row_count = Column(BigInteger, nullable=True)
    column_count = Column(Integer, nullable=True)
    table_name = Column(String, nullable=True)  # Name of the actual dynamic PG table
    error_message = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class DatasetColumn(Base):
    __tablename__ = "dataset_columns"

    id = Column(String, primary_key=True, default=generate_uuid)
    dataset_id = Column(String, ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    dtype = Column(String, nullable=False)
    nullable_count = Column(BigInteger, nullable=True)
    unique_count = Column(BigInteger, nullable=True)

class DatasetProfile(Base):
    __tablename__ = "dataset_profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    dataset_id = Column(String, ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False, unique=True)
    profile_json = Column(JSON, nullable=False)  # Stores ydata-profiling minimal mode output
