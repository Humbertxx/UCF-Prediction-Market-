"""User profile routes."""

import uuid

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from backend.auth.dependencies import get_current_user_id
from backend.database import get_db
from backend.services import user_stats_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me/profile-stats")
def get_my_profile_stats(
    db: Session = Depends(get_db),
    current_user_id: uuid.UUID = Depends(get_current_user_id),
):
    try:
        data = user_stats_service.get_user_profile_stats(db, user_id=current_user_id)
        return {"success": True, "data": data.model_dump(mode="json"), "error": None}
    except user_stats_service.ServiceError as exc:
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "data": None, "error": exc.message},
        )
    except Exception:
        db.rollback()
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "data": None,
                "error": "Failed to fetch profile stats",
            },
        )


@router.get("/{user_id}/profile-stats")
def get_user_profile_stats(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    _current_user_id: uuid.UUID = Depends(get_current_user_id),
):
    try:
        data = user_stats_service.get_user_profile_stats(db, user_id=user_id)
        return {
            "success": True,
            "data": data.model_dump(mode="json", exclude={"email"}),
            "error": None,
        }
    except user_stats_service.ServiceError as exc:
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "data": None, "error": exc.message},
        )
    except Exception:
        db.rollback()
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "data": None,
                "error": "Failed to fetch profile stats",
            },
        )
