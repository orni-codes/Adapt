def clamp(value: float) -> float:
    return max(0.0, min(1.0, value))


def calculate_learning_dna(
    answers: list[dict]
) -> dict:
    """
    Aggregate diagnostic answers into an initial Learning DNA.

    Each answer dict may contain:
      - question_type: str
      - understanding_score: float
      - explanation_quality: float
      - response_time: float
      - hint_used: bool
      - correct: bool
      - learning_signals: dict  (from Gemini, may be empty)

    We accumulate both per-type understanding scores AND
    the richer per-signal Gemini learning_signals so that
    one source of evidence reinforces the other.
    """

    # Per question-type understanding buckets
    type_scores: dict[str, list[float]] = {
        "visual": [],
        "recall": [],
        "example": [],
        "teach_back": [],
    }

    # Raw Gemini learning_signals across all answers
    signal_buckets: dict[str, list[float]] = {
        "visual_learning": [],
        "active_recall": [],
        "example_based": [],
        "teach_back": [],
        "passive_reading": [],
    }

    friction_scores: list[float] = []

    for answer in answers:
        understanding = answer.get("understanding_score", 0.5)
        response_time = answer.get("response_time", 10)
        hint_used = answer.get("hint_used", False)

        # Calculate learning friction
        friction = 0.2

        if response_time > 20:
            friction += 0.3
        elif response_time > 10:
            friction += 0.15

        if hint_used:
            friction += 0.2

        if understanding < 0.5:
            friction += 0.2

        friction_scores.append(clamp(friction))

        # Bucket by question type
        question_type = answer.get("question_type")
        if question_type in type_scores:
            type_scores[question_type].append(understanding)

        # Accumulate Gemini learning_signals (may be empty dict)
        signals = answer.get("learning_signals", {})
        for key in signal_buckets:
            val = signals.get(key)
            if val is not None:
                signal_buckets[key].append(float(val))

    def average(values, default=0.5):
        if not values:
            return default
        return sum(values) / len(values)

    # Base scores from question-type understanding
    type_visual = average(type_scores["visual"])
    type_recall = average(type_scores["recall"])
    type_example = average(type_scores["example"])
    type_teach_back = average(type_scores["teach_back"])

    # Gemini signal averages
    sig_visual = average(signal_buckets["visual_learning"])
    sig_recall = average(signal_buckets["active_recall"])
    sig_example = average(signal_buckets["example_based"])
    sig_teach = average(signal_buckets["teach_back"])
    sig_passive = average(signal_buckets["passive_reading"])

    # Blend: 60% from Gemini signals (richer evidence), 40% from type scores
    # If Gemini signals are missing (all 0.5), type scores dominate naturally.
    def blend(sig, typ, sig_weight=0.6):
        return clamp(sig * sig_weight + typ * (1 - sig_weight))

    visual = blend(sig_visual, type_visual)
    recall = blend(sig_recall, type_recall)
    example = blend(sig_example, type_example)
    teach_back = blend(sig_teach, type_teach_back)
    passive_reading = clamp(sig_passive)

    friction = average(friction_scores, 0.0)

    strategies = {
        "visual": visual,
        "retrieval": recall,
        "example": example,
        "teach_back": teach_back,
    }

    preferred_strategy = max(strategies, key=strategies.get)

    return {
        "visual_learning": round(visual, 3),
        "active_recall": round(recall, 3),
        "example_based": round(example, 3),
        "teach_back": round(teach_back, 3),
        "passive_reading": round(passive_reading, 3),
        "friction_score": round(friction, 3),
        "preferred_strategy": preferred_strategy,
    }