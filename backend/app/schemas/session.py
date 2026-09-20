import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import (
    StudySession,
    Interaction,
    LearningProfile
)

from app.services.adaptive_engine import choose_strategy
from app.services.gemini import (
    generate_lesson,
    evaluate_answer
)


router = APIRouter(
    prefix="/api/sessions",
    tags=["Study Sessions"]
)


class StudentResponse(BaseModel):
    answer: str
    confidence: int = 3


@router.post("/start")
def start_session(
    user_id: int,
    topic: str,
    db: Session = Depends(get_db)
):

    profile = db.query(
        LearningProfile
    ).filter(
        LearningProfile.user_id == user_id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Learning profile not found. Complete diagnostic first."
        )

    session = StudySession(
        user_id=user_id,
        topic=topic,
        understanding_score=0.0,
        friction_score=0.0
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    strategy = choose_strategy(
        profile,
        understanding_score=0.5,
        friction_score=profile.friction_score
    )

    lesson_text = generate_lesson(
        topic=topic,
        strategy=strategy,
        difficulty=1
    )

    try:
        lesson = json.loads(lesson_text)

    except json.JSONDecodeError:
        lesson = {
            "strategy": strategy,
            "explanation": lesson_text,
            "question": "What do you understand so far?",
            "difficulty": 1
        }

    return {
        "session_id": session.id,
        "topic": topic,
        "strategy": strategy,
        "lesson": lesson
    }


@router.post("/{session_id}/respond")
def respond_to_session(
    session_id: int,
    response: StudentResponse,
    db: Session = Depends(get_db)
):

    # Find study session
    session = db.query(
        StudySession
    ).filter(
        StudySession.id == session_id
    ).first()

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Study session not found"
        )

    # Find student's Learning DNA
    profile = db.query(
        LearningProfile
    ).filter(
        LearningProfile.user_id == session.user_id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Learning profile not found"
        )

    # Evaluate student's answer with Gemini
    evaluation_text = evaluate_answer(
        session.topic,
        response.answer
    )

    try:
        evaluation = json.loads(
            evaluation_text
        )

    except json.JSONDecodeError:
        evaluation = {
            "correct": False,
            "understanding_score": 0.5,
            "explanation_quality": 0.5,
            "misconception": "",
            "feedback": ""
        }

    understanding = float(
        evaluation.get(
            "understanding_score",
            0.5
        )
    )

    # Calculate friction
    friction = 0.2

    if understanding < 0.5:
        friction += 0.4

    if response.confidence <= 2:
        friction += 0.2

    friction = min(
        friction,
        1.0
    )

    # Remember current strategy
    current_strategy = profile.preferred_strategy

    # Decide next strategy
    next_strategy = choose_strategy(
        profile,
        understanding_score=understanding,
        friction_score=friction,
        previous_strategy=current_strategy
    )

    # Difficulty
    if understanding >= 0.8:
        difficulty = 2
    else:
        difficulty = 1

    # Generate next lesson
    lesson_text = generate_lesson(
        topic=session.topic,
        strategy=next_strategy,
        difficulty=difficulty,
        previous_answer=response.answer
    )

    try:
        lesson = json.loads(
            lesson_text
        )

    except json.JSONDecodeError:
        lesson = {
            "strategy": next_strategy,
            "explanation": lesson_text,
            "question": "What do you understand so far?",
            "difficulty": difficulty
        }

    # Save interaction
    interaction = Interaction(
        session_id=session.id,
        strategy_used=next_strategy,
        question=lesson.get("question"),
        student_answer=response.answer,
        understanding_score=understanding,
        friction_score=friction
    )

    db.add(interaction)

    # Update session
    session.understanding_score = understanding
    session.friction_score = friction

    # Update Learning DNA
    profile.friction_score = friction
    profile.preferred_strategy = next_strategy

    db.commit()

    adapted = (
        next_strategy != current_strategy
    )

    return {
        "session_id": session.id,
        "understanding_score": understanding,
        "friction_score": friction,
        "previous_strategy": current_strategy,
        "strategy": next_strategy,
        "adapted": adapted,
        "lesson": lesson,
        "evaluation": evaluation
    }