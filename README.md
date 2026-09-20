# ADAPT

### Stop studying harder. Start studying your way.

**ADAPT** is an AI-powered adaptive learning platform that learns **how a student learns** and continuously changes **how the student is taught**.

Instead of simply recommending what to study next, ADAPT builds a dynamic **Learning DNA** through short diagnostic interactions and uses that information to adapt explanations, examples, questioning, difficulty, and learning strategies in real time.

---

## The Problem

Students have more educational resources than ever, but access to content does not guarantee understanding.

A student may:

* Understand concepts better through examples
* Need visual explanations for abstract topics
* Learn through active recall rather than passive reading
* Need simpler explanations before increasing difficulty
* Understand a concept but struggle to recall it later
* Learn better when asked to explain a concept themselves

However, most learning platforms primarily focus on:

> **What should the student learn?**

rather than:

> **How should this student be taught?**

This mismatch can lead to frustration, disengagement, inefficient study sessions, and shallow understanding.

---

## Our Solution

ADAPT introduces **personalized learning methodology**.

The platform builds a dynamic **Learning DNA** for each student by observing how they interact with learning material.

It then continuously adapts the teaching approach based on evidence from those interactions.

### Core Loop

```text
DISCOVER
    ↓
TEACH
    ↓
OBSERVE
    ↓
ADAPT
    ↓
REMEMBER
    ↺
```

Unlike a traditional workflow:

```text
PLAN → STUDY → COMPLETE
```

ADAPT continuously asks:

> **What teaching approach is helping this student understand right now?**

---

# Learning DNA

Learning DNA is a dynamic representation of the teaching approaches that appear to work best for a particular learner.

It can incorporate signals related to:

* Visual reasoning
* Example-based learning
* Active recall
* Teach-back
* Conceptual explanation
* Guided questioning
* Difficulty response
* Pacing
* Learning friction
* Recall performance

### Important

Learning DNA is **not a permanent personality label**.

It is an evolving representation based on the student's interactions and is continuously updated as more evidence becomes available.

---

# How ADAPT Works

## 1. Discover

The student begins with short diagnostic interactions.

The system observes how they respond to different types of questions and explanations.

---

## 2. Build Learning DNA

The system analyzes interaction signals to identify which teaching methodologies appear to produce stronger understanding.

For example:

```text
Student responds strongly to examples
            ↓
Increase example-based explanations
```

or:

```text
Student understands explanation
but struggles with recall
            ↓
Increase active-recall interactions
```

---

## 3. Teach

The AI generates an explanation using a suitable teaching strategy.

Possible strategies include:

* Conceptual explanation
* Real-world analogy
* Example-based teaching
* Visual reasoning
* Guided questioning
* Active recall
* Teach-back

---

## 4. Observe

ADAPT analyzes the student's response.

Signals can include:

* Correctness
* Response quality
* Repeated mistakes
* Clarification requests
* Recall ability
* Explanation quality
* Interaction patterns

---

## 5. Adapt

The system changes the teaching methodology based on the observed signals.

It can modify:

* Explanation style
* Examples
* Difficulty
* Question type
* Pacing
* Recall frequency
* Scaffolding

---

## 6. Remember

After understanding is established, ADAPT reinforces the concept using recall and targeted practice.

This helps move the student from:

```text
Exposure
   ↓
Understanding
   ↓
Recall
   ↓
Retention
```

---

# Example

Imagine a student learning **Binary Search**.

### Initial attempt

The AI provides a conceptual explanation.

The student struggles.

ADAPT observes that the student performs better when concepts are connected to concrete examples.

### Adaptation

Instead of repeating the same explanation:

```text
Conceptual explanation
        ↓
Real-world analogy
        ↓
Concrete example
        ↓
Guided question
        ↓
Student explains the concept
```

The student demonstrates improved understanding.

ADAPT then increases the difficulty.

The important part is that the **teaching method changed because of evidence from the student**.

---

# Key Features

### 🧬 Learning DNA

Builds a dynamic learner profile based on observed learning behavior.

### 🤖 Adaptive AI Tutor

Uses AI to generate explanations and interactions suited to the learner.

### 🔄 Continuous Adaptation

Teaching strategies change as new evidence about the learner becomes available.

### 🧠 Active Recall

Uses questioning and retrieval rather than relying only on passive reading.

### 🗣️ Teach-Back

Encourages students to explain concepts in their own words.

### 📈 Difficulty Adaptation

Adjusts challenge based on demonstrated understanding.

### 🎯 Subject-Specific Learning

Learning interactions are generated according to the subject and concept being studied rather than relying on generic questions.

### 📊 Learning Insights

Provides students with an evolving view of their learning patterns and progress.

---

# What Makes ADAPT Different?

ADAPT is **not simply another AI tutor**.

Traditional learning systems often focus on:

```text
What should I learn?
```

Performance systems focus on:

```text
How well am I doing?
```

ADAPT focuses on:

```text
How should I be taught?
```

### Our differentiation

> **Personalized learning methodology.**

The goal is not only to personalize the content.

The goal is to personalize the **way the content is taught**.

---

# System Architecture

```text
                    ┌─────────────────────┐
                    │       Student       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Frontend       │
                    │ React + Tailwind    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      FastAPI        │
                    │      Backend        │
                    └──────────┬──────────┘
                               │
                  ┌────────────┴────────────┐
                  ▼                         ▼
        ┌──────────────────┐      ┌──────────────────┐
        │   Gemini AI      │      │   PostgreSQL     │
        │  AI Generation   │      │  Learning State  │
        └────────┬─────────┘      └────────┬─────────┘
                 │                         │
                 └────────────┬────────────┘
                              ▼
                    ┌─────────────────────┐
                    │ Adaptive Decision   │
                    │      Engine         │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Teaching Strategy   │
                    │ Selection / Update  │
                    └──────────┬──────────┘
                               │
                               ▼
                         Back to Student
```

---

# Technology Stack

## Frontend

* React
* JavaScript
* HTML5
* CSS3
* Tailwind CSS

## Backend

* Python
* FastAPI
* Uvicorn
* Pydantic

## AI

* Google Gemini API
* Gemini-based content generation
* AI-driven adaptive teaching interactions

## Database

* PostgreSQL

## Development Tools

* Git
* GitHub
* VS Code
* Figma

---

# Project Structure

```text
ADAPT/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── config.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   └── services/
│   │
│   ├── requirements.txt
│   └── ...
│
├── .gitignore
├── README.md
└── ...
```

> The exact structure may vary depending on the current implementation.

---

# Getting Started

## Prerequisites

Make sure you have installed:

* Node.js
* npm
* Python 3.10+
* PostgreSQL
* Git

You will also need a Google Gemini API key.

---

# Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

---

# Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

### Windows

```bash
python -m venv venv
```

Activate it:

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```


# Start the Backend

From the backend directory:

```bash
uvicorn app.main:app --reload
```

The API will typically run at:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

---

# Frontend Setup

Open another terminal.

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will typically be available at:

```text
http://localhost:5173
```

---

# Environment Configuration

If the frontend requires an API URL, configure it using a frontend environment file.

Example:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Do not expose secret API keys in frontend code.

---

# AI Architecture

ADAPT uses Gemini for AI-powered learning interactions.

The AI layer is responsible for tasks such as:

* Generating explanations
* Creating subject-specific questions
* Providing examples
* Evaluating responses
* Generating follow-up questions
* Supporting teach-back interactions
* Adjusting difficulty
* Supporting adaptive teaching decisions

The application separates the AI generation layer from the learner state so that the system can continuously use interaction history when deciding what to do next.

---

# Adaptive Learning Example

A simplified decision flow:

```text
Student Response
       │
       ▼
Evaluate Understanding
       │
       ├───────────────┐
       │               │
       ▼               ▼
 Strong            Weak / Unclear
 Understanding        Understanding
       │               │
       ▼               ▼
Increase           Change Teaching
Difficulty         Methodology
       │               │
       └───────┬───────┘
               ▼
        Generate Next Step
               │
               ▼
          Observe Again
```

This creates a continuous feedback loop rather than a fixed lesson sequence.

---

# Future Scope

ADAPT can evolve beyond the current MVP into a broader adaptive learning infrastructure.

Potential directions include:

* Long-term learner modeling
* More sophisticated learning-state estimation
* Multimodal learning
* Voice-based tutoring
* Personalized revision schedules
* Spaced repetition
* Teacher dashboards
* Institutional analytics
* Wearable / behavioral learning signals
* Accessibility-focused teaching strategies
* Integration with existing educational platforms
* Support for additional subjects and curricula

---

# Impact

ADAPT aims to make learning more responsive to the individual student.

Instead of expecting every learner to adapt to the same teaching method, the system continuously experiments with and learns from different teaching strategies.

The long-term vision is:

> **A learning system that becomes better at teaching you the more you interact with it.**

---

# Vision

Education does not need one perfect way to teach everyone.

It needs systems capable of discovering what works for each learner.

### ADAPT

**Discover → Teach → Observe → Adapt → Remember**

---

# Team

Built for HACK DEVENGERS 2.0


# Links

### GitHub

[Add repository link]

### Live Demo

[Add deployment link]

### Presentation

[Add Google Drive / PPT link]

---

# License

This project is currently intended for educational and hackathon purposes.

Add an appropriate open-source license if you intend to make the project publicly reusable.

---

## ADAPT

### Stop studying harder.

### Start studying your way.

> **ADAPT doesn't just learn what you know.
> It learns how to teach you.**
