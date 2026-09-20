def choose_strategy(
    profile,
    understanding_score: float,
    friction_score: float,
    previous_strategy: str | None = None
):

    # High friction means we need to simplify
    if friction_score >= 0.7:
        if previous_strategy != "analogy":
            return "analogy"

        return "example"

    # Student is struggling
    if understanding_score < 0.5:

        if previous_strategy == "visual":
            return "analogy"

        if previous_strategy == "analogy":
            return "example"

        if previous_strategy == "example":
            return "socratic"

        return "visual"

    # Student understands well
    if understanding_score >= 0.8:

        if profile.active_recall >= 0.75:
            return "retrieval"

        if profile.teach_back >= 0.75:
            return "teach_back"

    # Use their strongest learning preference
    strategies = {
        "visual": profile.visual_learning,
        "example": profile.example_based,
        "retrieval": profile.active_recall,
        "teach_back": profile.teach_back
    }

    return max(
        strategies,
        key=strategies.get
    )
