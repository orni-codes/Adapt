from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User, LearningProfile
from app.auth.dependencies import get_current_user


router = APIRouter(
    prefix="/api/learning",
    tags=["Learning DNA"]
)


@router.get("/profile/me")
def get_my_learning_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(
        LearningProfile
    ).filter(
        LearningProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Learning profile not found"
        )

    return {
        "user_id": current_user.id,
        "visual_learning": profile.visual_learning,
        "active_recall": profile.active_recall,
        "example_based": profile.example_based,
        "teach_back": profile.teach_back,
        "passive_reading": profile.passive_reading,
        "friction_score": profile.friction_score,
        "preferred_strategy": profile.preferred_strategy
    }


@router.get("/profile/{user_id}")
def get_learning_profile(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Cannot access another user's learning profile"
        )

    profile = db.query(
        LearningProfile
    ).filter(
        LearningProfile.user_id == user_id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Learning profile not found"
        )

    return {
        "user_id": user_id,
        "visual_learning": profile.visual_learning,
        "active_recall": profile.active_recall,
        "example_based": profile.example_based,
        "teach_back": profile.teach_back,
        "passive_reading": profile.passive_reading,
        "friction_score": profile.friction_score,
        "preferred_strategy": profile.preferred_strategy
    }