import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import (
    User,
    StudySession,
    Interaction,
    LearningProfile
)
from app.auth.dependencies import get_current_user

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
    topic: str,
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    effective_user_id = current_user.id

    profile = db.query(
        LearningProfile
    ).filter(
        LearningProfile.user_id == effective_user_id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Learning profile not found. Complete diagnostic first."
        )

    session = StudySession(
        user_id=effective_user_id,
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

    # Persist the opening lesson as the first Interaction so that
    # GET /api/sessions/{id} can always reconstruct the session state.
    # student_answer is null because the student has not yet responded.
    opening_interaction = Interaction(
        session_id=session.id,
        strategy_used=strategy,
        question=lesson.get("question"),
        student_answer=None,
        understanding_score=None,
        friction_score=None,
    )
    db.add(opening_interaction)
    db.commit()

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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Find the study session
    session = db.query(
        StudySession
    ).filter(
        StudySession.id == session_id
    ).first()

    if not session or session.user_id != current_user.id:
        raise HTTPException(
            status_code=404,
            detail="Study session not found"
        )

    # Find the student's Learning DNA
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

    # Ask Gemini to evaluate the student's response
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

    # Remember the current teaching strategy
    current_strategy = profile.preferred_strategy

    # Choose the next strategy
    next_strategy = choose_strategy(
        profile,
        understanding_score=understanding,
        friction_score=friction,
        previous_strategy=current_strategy
    )

    # Increase difficulty when understanding is high
    if understanding >= 0.8:
        difficulty = 2
    else:
        difficulty = 1

    # Ask Gemini to generate the next lesson
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

    # Update study session
    session.understanding_score = understanding
    session.friction_score = friction

    # Update Learning DNA
    previous_dna = {
        "visual_learning": profile.visual_learning,
        "active_recall": profile.active_recall,
        "example_based": profile.example_based,
        "teach_back": profile.teach_back,
        "passive_reading": profile.passive_reading,
    }

    profile.friction_score = friction
    profile.preferred_strategy = next_strategy

    learning_signals = evaluation.get(
        "learning_signals",
        {}
    )

    # Small update weight so one interaction does not
    # completely change the learner model.
    learning_rate = 0.10

    def update_learning_dimension(
        current_value,
        signal
    ):
        signal = float(signal)
        signal = max(0.0, min(1.0, signal))
        return (
            current_value +
            learning_rate * (signal - current_value)
        )

    profile.visual_learning = update_learning_dimension(
        profile.visual_learning,
        learning_signals.get(
            "visual_learning",
            profile.visual_learning
        )
    )

    profile.active_recall = update_learning_dimension(
        profile.active_recall,
        learning_signals.get(
            "active_recall",
            profile.active_recall
        )
    )

    profile.example_based = update_learning_dimension(
        profile.example_based,
        learning_signals.get(
            "example_based",
            profile.example_based
        )
    )

    profile.teach_back = update_learning_dimension(
        profile.teach_back,
        learning_signals.get(
            "teach_back",
            profile.teach_back
        )
    )

    profile.passive_reading = update_learning_dimension(
        profile.passive_reading,
        learning_signals.get(
            "passive_reading",
            profile.passive_reading
        )
    )

    # Adapt the Learning DNA based on the student's interaction
    learning_delta = 0.03

    if next_strategy == "visual":
        profile.visual_learning = min(
            1.0,
            profile.visual_learning + learning_delta
        )

    elif next_strategy == "retrieval":
        profile.active_recall = min(
            1.0,
            profile.active_recall + learning_delta
        )

    elif next_strategy == "example":
        profile.example_based = min(
            1.0,
            profile.example_based + learning_delta
        )

    elif next_strategy == "teach_back":
        profile.teach_back = min(
            1.0,
            profile.teach_back + learning_delta
        )

    # If the student struggled with the previous strategy,
    # slightly reduce confidence in that strategy.
    if understanding < 0.5:
        if current_strategy == "visual":
            profile.visual_learning = max(
                0.0,
                profile.visual_learning - 0.02
            )

        elif current_strategy == "retrieval":
            profile.active_recall = max(
                0.0,
                profile.active_recall - 0.02
            )

        elif current_strategy == "example":
            profile.example_based = max(
                0.0,
                profile.example_based - 0.02
            )

        elif current_strategy == "teach_back":
            profile.teach_back = max(
                0.0,
                profile.teach_back - 0.02
            )

    learning_dna_changes = {
        "visual_learning": round(
            profile.visual_learning -
            previous_dna["visual_learning"],
            3
        ),

        "active_recall": round(
            profile.active_recall -
            previous_dna["active_recall"],
            3
        ),

        "example_based": round(
            profile.example_based -
            previous_dna["example_based"],
            3
        ),

        "teach_back": round(
            profile.teach_back -
            previous_dna["teach_back"],
            3
        ),

        "passive_reading": round(
            profile.passive_reading -
            previous_dna["passive_reading"],
            3
        )
    }

    db.commit()
    db.refresh(profile)

    learning_dna = {
        "visual_learning": profile.visual_learning,
        "active_recall": profile.active_recall,
        "example_based": profile.example_based,
        "teach_back": profile.teach_back,
        "passive_reading": profile.passive_reading,
        "friction_score": profile.friction_score,
        "preferred_strategy": profile.preferred_strategy
    }

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
        "evaluation": evaluation,
        "learning_dna": learning_dna,
        "learning_dna_changes": learning_dna_changes
    }


@router.get("/")
def list_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = (
        db.query(StudySession)
        .filter(StudySession.user_id == current_user.id)
        .order_by(StudySession.created_at.desc(), StudySession.id.desc())
        .all()
    )
    return [
        {
            "session_id": s.id,
            "topic": s.topic,
            "understanding_score": s.understanding_score,
            "friction_score": s.friction_score,
            "created_at": s.created_at
        }
        for s in sessions
    ]


@router.get("/{session_id}")
def get_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(StudySession).filter(
        StudySession.id == session_id
    ).first()

    if not session or session.user_id != current_user.id:
        raise HTTPException(
            status_code=404,
            detail="Study session not found"
        )

    interactions = db.query(Interaction).filter(
        Interaction.session_id == session_id
    ).order_by(
        Interaction.created_at.asc(),
        Interaction.id.asc()
    ).all()

    return {
        "session_id": session.id,
        "user_id": session.user_id,
        "topic": session.topic,
        "understanding_score": session.understanding_score,
        "friction_score": session.friction_score,
        "created_at": session.created_at,
        "interactions": [
            {
                "id": interaction.id,
                "strategy_used": interaction.strategy_used,
                "question": interaction.question,
                "student_answer": interaction.student_answer,
                "understanding_score": interaction.understanding_score,
                "friction_score": interaction.friction_score,
                "created_at": interaction.created_at
            }
            for interaction in interactions
        ]
    }
