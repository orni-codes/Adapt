from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings


engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def run_migrations():
    """
    Safely add new nullable columns to existing tables.
    Uses IF NOT EXISTS so it is idempotent — safe to run on every startup.
    Existing data is never touched.
    """
    migrations = [
        # LearningProfile: record which topic the user picked during onboarding
        """
        ALTER TABLE learning_profiles
        ADD COLUMN IF NOT EXISTS diagnostic_topic VARCHAR;
        """,
        # DiagnosticAnswer: store Gemini learning_signals as JSON text
        """
        ALTER TABLE diagnostic_answers
        ADD COLUMN IF NOT EXISTS learning_signals_json TEXT;
        """,
    ]

    with engine.connect() as conn:
        for stmt in migrations:
            try:
                conn.execute(text(stmt.strip()))
                conn.commit()
            except Exception as e:
                # Log but never crash on migration — may already exist in some DBs
                print(f"Migration note (non-fatal): {e}")


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()