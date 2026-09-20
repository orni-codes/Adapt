from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    Text
)

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class LearningProfile(Base):
    __tablename__ = "learning_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    visual_learning = Column(Float, default=0.5)
    active_recall = Column(Float, default=0.5)
    example_based = Column(Float, default=0.5)
    teach_back = Column(Float, default=0.5)
    passive_reading = Column(Float, default=0.5)

    friction_score = Column(Float, default=0.0)

    preferred_strategy = Column(
        String,
        default="example"
    )

    # Stores the topic chosen during the initial diagnostic (onboarding)
    diagnostic_topic = Column(
        String,
        nullable=True
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    topic = Column(String, nullable=False)

    understanding_score = Column(
        Float,
        default=0.0
    )

    friction_score = Column(
        Float,
        default=0.0
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(
        Integer,
        ForeignKey("study_sessions.id"),
        nullable=False
    )

    strategy_used = Column(String)

    question = Column(Text)

    student_answer = Column(Text)

    understanding_score = Column(Float)

    friction_score = Column(Float)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )
class DiagnosticAnswer(Base):
    __tablename__ = "diagnostic_answers"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    question_id = Column(
        String,
        nullable=False
    )

    question_type = Column(
        String,
        nullable=False
    )

    answer = Column(
        Text,
        nullable=False
    )

    response_time = Column(
        Float,
        default=0
    )

    confidence = Column(
        Integer,
        nullable=True
    )

    hint_used = Column(
        Integer,
        default=0
    )

    correct = Column(
        Integer,
        default=0
    )

    understanding_score = Column(
        Float,
        default=0.5
    )

    explanation_quality = Column(
        Float,
        default=0.5
    )

    # Serialized JSON string of Gemini learning_signals for this answer
    learning_signals_json = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )