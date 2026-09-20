import json

from google import genai

from app.core.config import settings


client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


def is_gemini_quota_error(error: Exception) -> bool:
    """Return True if the error is a Gemini 429 quota/rate-limit error."""
    # google.genai.errors.ClientError exposes .code as an integer
    code = getattr(error, "code", None)
    if code == 429:
        return True
    # Some SDK versions surface it in the message string instead
    msg = str(error).lower()
    return "429" in msg or "resource_exhausted" in msg


def _evaluate_answer_fallback() -> str:
    """Return a safe, valid JSON fallback for evaluate_answer()."""
    return json.dumps({
        "correct": False,
        "understanding_score": 0.5,
        "explanation_quality": 0.5,
        "misconception": "",
        "feedback": "Your response was saved. AI evaluation is temporarily unavailable.",
        "learning_signals": {
            "visual_learning": 0.5,
            "active_recall": 0.5,
            "example_based": 0.5,
            "teach_back": 0.5,
            "passive_reading": 0.5,
        },
    })


def _generate_lesson_fallback(topic: str, strategy: str, difficulty: int) -> str:
    """Return a safe, valid JSON fallback for generate_lesson()."""
    return json.dumps({
        "strategy": strategy,
        "explanation": (
            f"Let's work through {topic} step by step. "
            "Start by identifying the main idea, then connect it to a simple example."
        ),
        "question": f"In your own words, what is the main idea behind {topic}?",
        "difficulty": difficulty,
    })


def evaluate_answer(question: str, answer: str) -> str:
    prompt = f"""
You are ADAPT, an adaptive learning system evaluating a student's response.

Your job is to evaluate both:
1. How well the student understood the concept.
2. What the response reveals about the student's learning behavior.

QUESTION:
{question}

STUDENT ANSWER:
{answer}

Return ONLY valid JSON in exactly this structure:

{{
    "correct": true,
    "understanding_score": 0.0,
    "explanation_quality": 0.0,
    "misconception": "",
    "feedback": "",

    "learning_signals": {{
        "visual_learning": 0.0,
        "active_recall": 0.0,
        "example_based": 0.0,
        "teach_back": 0.0,
        "passive_reading": 0.0
    }}
}}

Rules:

- correct must be true or false.
- understanding_score must be between 0 and 1.
- explanation_quality must be between 0 and 1.
- Every learning signal must be between 0 and 1.
- learning_signals represent how strongly this response suggests that the student may benefit from that learning approach.
- Do NOT make extreme assumptions from a single response.
- Use moderate values when evidence is weak.
- A strong ability to explain something in their own words can increase teach_back.
- Successfully recalling information without support can increase active_recall.
- Responses that rely on concrete examples can increase example_based.
- Responses that demonstrate spatial, structural, visual, or diagram-like reasoning can increase visual_learning.
- passive_reading should represent evidence that the student may benefit from conventional text-based explanation.
- If there is insufficient evidence for a signal, use a value around 0.5.
- misconception should be an empty string if there is no clear misconception.
- feedback should be short and useful to the student.
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )
        return response.text

    except Exception as e:
        if is_gemini_quota_error(e):
            print("WARNING: Gemini quota exhausted — using fallback evaluation.")
        else:
            print(f"WARNING: Gemini unexpected error in evaluate_answer() — using fallback. Error: {type(e).__name__}")
        return _evaluate_answer_fallback()


def generate_lesson(
    topic: str,
    strategy: str,
    difficulty: int,
    previous_answer: str | None = None,
) -> str:

    strategy_instructions = {

        "visual": """
Explain using a visual mental model.
Use structure, spatial relationships,
arrows, or a simple text diagram.
Do not rely on long paragraphs.
""",

        "analogy": """
Explain using a familiar real-world analogy.
Make the analogy concrete and intuitive.
Then connect the analogy back to the concept.
""",

        "example": """
Teach using a concrete example.
Show the example step-by-step.
Then ask the student to apply it.
""",

        "socratic": """
Do not immediately give the answer.
Guide the student using a short sequence
of questions that helps them discover it.
""",

        "retrieval": """
Give a concise explanation and then test
the student's memory with an active recall question.
""",

        "teach_back": """
Explain the concept briefly and ask the student
to explain it back in their own words.
"""
    }

    instruction = strategy_instructions.get(
        strategy,
        strategy_instructions["example"]
    )

    prompt = f"""
You are ADAPT, an adaptive AI tutor.

Your job is NOT simply to answer the student.

You must teach the concept using the requested
teaching strategy.

TOPIC:
{topic}

TEACHING STRATEGY:
{strategy}

DIFFICULTY:
{difficulty}

PREVIOUS STUDENT ANSWER:
{previous_answer or "None"}

TEACHING INSTRUCTIONS:
{instruction}

Return ONLY valid JSON:

{{
    "strategy": "{strategy}",
    "explanation": "...",
    "question": "...",
    "difficulty": {difficulty}
}}

Rules:

- Keep the explanation concise.
- The question should test understanding.
- Do not mention that you are an AI.
- Do not say "as an AI".
- Match the requested strategy.
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )
        return response.text

    except Exception as e:
        if is_gemini_quota_error(e):
            print("WARNING: Gemini quota exhausted — using fallback lesson.")
        else:
            print(f"WARNING: Gemini unexpected error in generate_lesson() — using fallback. Error: {type(e).__name__}")
        return _generate_lesson_fallback(topic, strategy, difficulty)