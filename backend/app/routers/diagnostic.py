import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import (
    User,
    LearningProfile,
    DiagnosticAnswer
)
from app.auth.dependencies import get_current_user
from app.schemas.diagnostic import (
    DiagnosticAnswer as DiagnosticAnswerSchema
)
from app.services.diagnostic_questions import DIAGNOSTIC_QUESTIONS, fill_topic
from app.services.diagnostic_engine import calculate_learning_dna
from app.services.gemini import evaluate_answer


router = APIRouter(
    prefix="/api/diagnostic",
    tags=["Diagnostic"]
)


@router.get("/questions")
def get_questions(topic: str = "this subject"):
    """
    Return diagnostic questions with {topic} placeholders filled.
    topic defaults to "this subject" so it works without a topic param.
    """
    filled = fill_topic(DIAGNOSTIC_QUESTIONS, topic)
    return {
        "questions": filled
    }


@router.post("/answer")
def submit_answer(
    answer: DiagnosticAnswerSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    question = next(
        (
            q for q in DIAGNOSTIC_QUESTIONS
            if q["id"] == answer.question_id
        ),
        None
    )

    if not question:
        return {
            "error": "Question not found"
        }

    # Use the filled question text for evaluation if topic was provided
    question_text = question["question"]

    evaluation_text = evaluate_answer(
        question_text,
        answer.answer
    )

    try:
        evaluation = json.loads(evaluation_text)

    except json.JSONDecodeError:
        evaluation = {
            "correct": False,
            "understanding_score": 0.5,
            "explanation_quality": 0.5,
            "misconception": "",
            "feedback": "Evaluation completed.",
            "learning_signals": {
                "visual_learning": 0.5,
                "active_recall": 0.5,
                "example_based": 0.5,
                "teach_back": 0.5,
                "passive_reading": 0.5,
            }
        }

    # Serialise Gemini learning_signals so the engine can use them later
    learning_signals = evaluation.get("learning_signals", {})
    learning_signals_json = json.dumps(learning_signals) if learning_signals else None

    # Associate answer with authenticated user
    diagnostic_record = DiagnosticAnswer(
        user_id=current_user.id,
        question_id=answer.question_id,
        question_type=question["type"],
        answer=answer.answer,
        response_time=answer.response_time,
        confidence=answer.confidence,
        hint_used=1 if answer.hint_used else 0,
        correct=1 if evaluation.get("correct") else 0,
        understanding_score=evaluation.get("understanding_score", 0.5),
        explanation_quality=evaluation.get("explanation_quality", 0.5),
        learning_signals_json=learning_signals_json,
    )

    db.add(diagnostic_record)
    db.commit()
    db.refresh(diagnostic_record)

    return {
        "message": "Answer evaluated and saved",
        "answer_id": diagnostic_record.id,
        "evaluation": evaluation
    }


@router.post("/complete/{user_id}")
def complete_diagnostic(
    user_id: int,
    topic: str = "",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Always enforce the current authenticated user
    effective_user_id = current_user.id

    answers_db = db.query(
        DiagnosticAnswer
    ).filter(
        DiagnosticAnswer.user_id == effective_user_id
    ).order_by(DiagnosticAnswer.id.desc()).all()

    if not answers_db:
        return {
            "error": "No diagnostic answers found"
        }

    # Build answer list including learning_signals_json for the engine
    answers = [
        {
            "question_type": answer.question_type,
            "response_time": answer.response_time,
            "hint_used": bool(answer.hint_used),
            "understanding_score": answer.understanding_score,
            "explanation_quality": answer.explanation_quality,
            "correct": bool(answer.correct),
            "learning_signals": (
                json.loads(answer.learning_signals_json)
                if answer.learning_signals_json
                else {}
            ),
        }
        for answer in answers_db
    ]

    profile_data = calculate_learning_dna(answers)

    profile = db.query(
        LearningProfile
    ).filter(
        LearningProfile.user_id == effective_user_id
    ).first()

    if not profile:
        profile = LearningProfile(
            user_id=effective_user_id
        )

        db.add(profile)

    profile.visual_learning = profile_data["visual_learning"]
    profile.active_recall = profile_data["active_recall"]
    profile.example_based = profile_data["example_based"]
    profile.teach_back = profile_data["teach_back"]
    profile.passive_reading = profile_data["passive_reading"]
    profile.friction_score = profile_data["friction_score"]
    profile.preferred_strategy = profile_data["preferred_strategy"]

    # Store the topic chosen during onboarding (if provided)
    if topic:
        profile.diagnostic_topic = topic

    db.commit()
    db.refresh(profile)

    return {
        "message": "Learning DNA generated",
        "profile": profile_data,
        "diagnostic_topic": profile.diagnostic_topic,
    }