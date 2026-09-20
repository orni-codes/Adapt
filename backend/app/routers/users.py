from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.db.models import User, StudySession, Interaction
from app.auth.dependencies import get_current_user


router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)


@router.post("/")
def create_user(
    name: str,
    db: Session = Depends(get_db)
):
    user = User(
        name=name
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "name": user.name
    }


def _build_session_history(sessions, db: Session):
    """
    Shared helper: for each StudySession, attach interaction_count and
    last_strategy by querying the interactions table.
    Returns a list of enriched dicts.
    """
    if not sessions:
        return []

    session_ids = [s.id for s in sessions]

    # Count interactions per session
    counts = (
        db.query(
            Interaction.session_id,
            func.count(Interaction.id).label("count")
        )
        .filter(Interaction.session_id.in_(session_ids))
        .group_by(Interaction.session_id)
        .all()
    )
    count_map = {row.session_id: row.count for row in counts}

    # Latest strategy per session (last interaction by id)
    latest_interactions = {}
    for sid in session_ids:
        last = (
            db.query(Interaction)
            .filter(Interaction.session_id == sid)
            .order_by(Interaction.id.desc())
            .first()
        )
        if last:
            latest_interactions[sid] = last.strategy_used

    return [
        {
            "session_id": s.id,
            "topic": s.topic,
            "understanding_score": s.understanding_score,
            "friction_score": s.friction_score,
            "created_at": s.created_at,
            "interaction_count": count_map.get(s.id, 0),
            "last_strategy": latest_interactions.get(s.id),
        }
        for s in sessions
    ]


@router.get("/me/history")
def get_my_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = (
        db.query(StudySession)
        .filter(StudySession.user_id == current_user.id)
        .order_by(StudySession.created_at.desc(), StudySession.id.desc())
        .all()
    )

    return _build_session_history(sessions, db)


@router.get("/{user_id}/history")
def get_user_history(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Cannot access another user's learning history"
        )

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    sessions = (
        db.query(StudySession)
        .filter(StudySession.user_id == user_id)
        .order_by(StudySession.created_at.desc(), StudySession.id.desc())
        .all()
    )

    return _build_session_history(sessions, db)