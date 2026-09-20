"""
Behavioral diagnostic questions for the ADAPT learning calibration.

Each question has a {topic} placeholder that is filled by the backend
based on the topic the user chose before starting the diagnostic.

Question types map to the scoring dimensions used by diagnostic_engine.py:
  recall      → active_recall
  visual      → visual_learning
  example     → example_based
  teach_back  → teach_back
  friction    → friction_score
  preference  → aggregated across dimensions
"""

DIAGNOSTIC_QUESTIONS = [
    # Q1 — Example vs analogy preference
    {
        "id": "example_1",
        "type": "example",
        "question": (
            "Here are two explanations of {topic}.\n\n"
            "A. A clear, detailed written definition that explains exactly "
            "what it is and how it works.\n\n"
            "B. A real-world analogy that connects {topic} to something "
            "familiar from everyday life.\n\n"
            "Which explanation would help you understand faster? "
            "Answer A or B, and tell us why."
        ),
    },

    # Q2 — Visual vs text preference
    {
        "id": "visual_1",
        "type": "visual",
        "question": (
            "When you are trying to understand something like {topic}, "
            "which would you prefer?\n\n"
            "A. A diagram, chart, or visual that shows how the parts connect.\n"
            "B. A written explanation with more detail and examples.\n\n"
            "Answer A or B and briefly explain your preference."
        ),
    },

    # Q3 — Active recall (short explanation removed, then question asked)
    {
        "id": "recall_1",
        "type": "recall",
        "question": (
            "Imagine someone gave you a one-paragraph explanation of {topic} "
            "a few minutes ago and you read it once.\n\n"
            "Without looking it up, write down what you think the main idea "
            "of {topic} is. It does not need to be perfect — just your best memory."
        ),
    },

    # Q4 — Step-by-step learning preference
    {
        "id": "preference_1",
        "type": "example",
        "question": (
            "You are about to learn something new about {topic}. "
            "How would you prefer to start?\n\n"
            "A. See a step-by-step worked example first\n"
            "B. Try solving a small problem yourself before seeing the answer\n"
            "C. See a real-world use case that shows why it matters\n"
            "D. Get a diagram or visual overview first\n\n"
            "Answer A, B, C, or D — and briefly explain your choice."
        ),
    },

    # Q5 — Teach-back
    {
        "id": "teach_back_1",
        "type": "teach_back",
        "question": (
            "Explain {topic} to someone who has never heard of it before. "
            "Pretend you are teaching a friend.\n\n"
            "Your explanation does not need to be perfect or complete — "
            "just explain it in your own words as simply as you can."
        ),
    },

    # Q6 — Friction behavior
    {
        "id": "friction_1",
        "type": "recall",
        "question": (
            "When you do not understand something after reading the first explanation, "
            "what do you usually do?\n\n"
            "A. Read the explanation again more carefully\n"
            "B. Search for a worked example\n"
            "C. Look for a video or diagram\n"
            "D. Try to apply it myself, even if I might get it wrong\n"
            "E. Ask someone to explain it differently\n"
            "F. Move on and come back later\n\n"
            "Answer one or more letters and describe what you typically do."
        ),
    },

    # Q7 — Confidence
    {
        "id": "confidence_1",
        "type": "recall",
        "question": (
            "After learning something new about {topic}, how confident do you "
            "usually feel about explaining it to someone else?\n\n"
            "1 — Not confident at all\n"
            "2 — Slightly confident\n"
            "3 — Somewhat confident\n"
            "4 — Fairly confident\n"
            "5 — Very confident\n\n"
            "Give a number and briefly explain why."
        ),
    },

    # Q8 — Learning preference summary
    {
        "id": "preference_2",
        "type": "teach_back",
        "question": (
            "When you are learning something difficult like {topic}, "
            "what usually helps you most?\n\n"
            "A. A visual explanation or diagram\n"
            "B. A real-world example\n"
            "C. A step-by-step explanation\n"
            "D. Trying it myself first\n"
            "E. Explaining it back in my own words\n"
            "F. Being guided by questions rather than given the answer\n\n"
            "Choose one or more and explain your thinking."
        ),
    },
]


def fill_topic(questions: list[dict], topic: str) -> list[dict]:
    """Return questions with {topic} placeholders replaced by the chosen topic."""
    filled = []
    for q in questions:
        filled.append({
            **q,
            "question": q["question"].replace("{topic}", topic),
        })
    return filled