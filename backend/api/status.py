from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database.connection import get_db
from database.models import Dataset, DatasetProfile

router = APIRouter()

@router.get("/api/dataset/{dataset_id}/status")
async def get_dataset_status(dataset_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    dataset = result.scalar_one_or_none()
    
    if not dataset:
        raise HTTPException(status_code=404, detail={"message": "Dataset not found", "code": "DATASET_NOT_FOUND"})
        
    response = {
        "id": dataset.id,
        "status": dataset.status,
        "filename": dataset.original_filename,
    }
    
    if dataset.status == "error":
        response["success"] = False
        response["code"] = "PIPELINE_ERROR"
        response["message"] = "The dataset processing pipeline failed to parse your file. Please ensure it's a valid CSV."
        response["error_details"] = dataset.error_message
        return response
        
    if dataset.status == "ready":
        response["success"] = True
        response["code"] = "DATASET_READY"
        response["message"] = "Dataset processed and analyzed successfully! You can now start querying."
        response["row_count"] = dataset.row_count
        response["column_count"] = dataset.column_count
        
        # Load profile
        profile_result = await db.execute(select(DatasetProfile).where(DatasetProfile.dataset_id == dataset_id))
        profile = profile_result.scalar_one_or_none()
        
        if profile:
            response["profile"] = profile.profile_json
            
    return response
