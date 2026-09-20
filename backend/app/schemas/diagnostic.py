from pydantic import BaseModel
from typing import Optional


class DiagnosticAnswer(BaseModel):
    user_id: int
    question_id: str
    answer: str
    response_time: float = 0
    confidence: Optional[int] = None
    hint_used: bool = False


class DiagnosticQuestion(BaseModel):
    id: str
    type: str
    question: str