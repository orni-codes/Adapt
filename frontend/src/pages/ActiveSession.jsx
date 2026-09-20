import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getSession, respondToSession } from '../api/sessions';
import SectionLabel from '../components/SectionLabel';
import {
  Loader2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export default function ActiveSession() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // ==================================================
  // LOADING / REQUEST STATE
  // ==================================================

  const [loading, setLoading] = useState(
    !location.state?.initialData
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // ==================================================
  // SESSION STATE
  // ==================================================

  const [sessionInfo, setSessionInfo] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentStrategy, setCurrentStrategy] = useState('visual');

  const [understandingScore, setUnderstandingScore] = useState(0.5);
  const [frictionScore, setFrictionScore] = useState(0.2);

  const [lastEvaluation, setLastEvaluation] = useState(null);
  const [adaptedNotice, setAdaptedNotice] = useState(false);

  // ==================================================
  // LEARNING DNA CHANGES
  // ==================================================

  /*
   * Stores the actual Learning DNA changes returned
   * by the backend after Gemini evaluates the response.
   *
   * Example:
   *
   * {
   *   visual_learning: 0.02,
   *   active_recall: -0.01,
   *   example_based: 0.03,
   *   teach_back: 0,
   *   passive_reading: -0.01
   * }
   */

  const [learningDnaChanges, setLearningDnaChanges] =
    useState(
      location.state?.learningDnaChanges || null
    );

  // ==================================================
  // RESPONSE STATE
  // ==================================================

  const [answerText, setAnswerText] = useState('');
  const [confidence, setConfidence] = useState(3);

  // Past interactions loaded from backend (for timeline)
  const [pastInteractions, setPastInteractions] = useState([]);

  // ==================================================
  // INITIALIZE SESSION
  // ==================================================

  useEffect(() => {
    if (location.state?.initialData) {
      const init = location.state.initialData;

      setSessionInfo({
        session_id: init.session_id,
        topic: init.topic,
      });

      setCurrentStrategy(
        init.strategy || 'visual'
      );

      setCurrentLesson(
        init.lesson || {
          explanation: `Beginning adaptive study of ${init.topic}.`,
          question:
            'What do you already know about this topic?',
        }
      );

      // If initial session data already contains DNA changes
      if (init.learning_dna_changes) {
        setLearningDnaChanges(
          init.learning_dna_changes
        );
      }

      setLoading(false);
    } else {
      loadSessionFromBackend();
    }
  }, [sessionId]);

  // ==================================================
  // LOAD EXISTING SESSION
  // ==================================================

  const loadSessionFromBackend = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getSession(sessionId);

      setSessionInfo(data);

      setUnderstandingScore(
        typeof data.understanding_score === 'number'
          ? data.understanding_score
          : 0.5
      );

      setFrictionScore(
        typeof data.friction_score === 'number'
          ? data.friction_score
          : 0.2
      );

      if (data.learning_dna_changes) {
        setLearningDnaChanges(
          data.learning_dna_changes
        );
      }

      if (
        data.interactions &&
        data.interactions.length > 0
      ) {
        // Store all interactions for the timeline display.
        // Interactions where student_answer is null are opening lessons
        // (created by start_session) — we still show them in the timeline.
        setPastInteractions(data.interactions);

        // Find the last interaction that has a real student answer to determine
        // the current lesson state. If none, use the opening interaction.
        const answeredInteractions = data.interactions.filter(
          (i) => i.student_answer !== null && i.student_answer !== undefined
        );

        const lastInteraction =
          answeredInteractions.length > 0
            ? answeredInteractions[answeredInteractions.length - 1]
            : data.interactions[data.interactions.length - 1];

        setCurrentStrategy(
          lastInteraction.strategy_used || 'visual'
        );

        // The question to answer next is the last stored question
        // (whether from an opening lesson or the latest generated lesson)
        const lastStoredQuestion = data.interactions[data.interactions.length - 1];
        setCurrentLesson({
          explanation:
            `Continuing your study of ${data.topic}. ` +
            `Here's where you left off.`,
          question:
            lastStoredQuestion.question ||
            'What happens next in this concept?',
        });
      } else {
        setCurrentStrategy('visual');
        setCurrentLesson({
          explanation:
            `Welcome to your adaptive study session on ${data.topic}. Let's explore the core concept.`,
          question:
            'In your own words, what is the primary purpose of this topic?',
        });
      }
    } catch (err) {
      console.error(
        'Failed to load session',
        err
      );

      setError(
        err.message ||
        'Session not found.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // SUBMIT STUDENT RESPONSE
  // ==================================================

  const handleSendResponse = async (e) => {
    if (e) {
      e.preventDefault();
    }

    // Prevent duplicate submissions
    if (
      !answerText.trim() ||
      submitting
    ) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setAdaptedNotice(false);

    try {
      // ==================================================
      // SEND RESPONSE TO BACKEND
      // ==================================================

      const result =
        await respondToSession(
          sessionId,
          {
            answer: answerText.trim(),
            confidence,
          }
        );

      // ==================================================
      // UPDATE UNDERSTANDING
      // ==================================================

      if (
        typeof result.understanding_score ===
        'number'
      ) {
        setUnderstandingScore(
          result.understanding_score
        );
      }

      // ==================================================
      // UPDATE FRICTION
      // ==================================================

      if (
        typeof result.friction_score ===
        'number'
      ) {
        setFrictionScore(
          result.friction_score
        );
      }

      // ==================================================
      // UPDATE STRATEGY
      // ==================================================

      if (result.strategy) {
        setCurrentStrategy(
          result.strategy
        );
      }

      // ==================================================
      // SHOW ADAPTATION
      // ==================================================

      if (result.adapted) {
        setAdaptedNotice(true);
      }

      // ==================================================
      // SAVE GEMINI EVALUATION
      // ==================================================

      if (result.evaluation) {
        setLastEvaluation(
          result.evaluation
        );
      }

      // ==================================================
      // SAVE REAL LEARNING DNA CHANGES
      // ==================================================

      if (
        result.learning_dna_changes
      ) {
        setLearningDnaChanges(
          result.learning_dna_changes
        );
      }

      // ==================================================
      // UPDATE LESSON
      // ==================================================

      if (result.lesson) {
        setCurrentLesson(
          result.lesson
        );
      }

      // Append this interaction to the timeline
      setPastInteractions((prev) => [
        ...prev,
        {
          id: Date.now(), // temporary key until reload
          strategy_used: result.strategy,
          question: result.lesson?.question || '',
          student_answer: answerText.trim(),
          understanding_score: result.understanding_score,
          friction_score: result.friction_score,
          created_at: new Date().toISOString(),
        },
      ]);

      // ==================================================
      // CLEAR ANSWER
      // ==================================================

      setAnswerText('');

    } catch (err) {
      console.error(
        'Failed to submit answer',
        err
      );

      setError(
        err.message ||
        "We couldn't generate your next lesson. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==================================================
  // FRICTION LABEL
  // ==================================================

  const getFrictionLabel = (value) => {
    if (value <= 0.35) {
      return 'Low';
    }

    if (value <= 0.65) {
      return 'Moderate';
    }

    return 'High';
  };

  // ==================================================
  // FORMAT AI EXPLANATION
  // ==================================================

  const formatExplanation = (text) => {
    if (!text) {
      return null;
    }

    const hasCodeBlock =
      text.includes('```');

    if (hasCodeBlock) {
      const parts =
        text.split('```');

      return (
        <div className="flex flex-col gap-4">
          {parts.map(
            (part, index) => {
              // Code block
              if (index % 2 === 1) {
                return (
                  <div
                    key={index}
                    className="bg-[#070A0F] border border-[#141C24] rounded-lg p-5 font-mono text-xs text-[#00C7D4] whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto"
                  >
                    {part.trim()}
                  </div>
                );
              }

              // Empty text
              if (!part.trim()) {
                return null;
              }

              // Normal text
              return (
                <p
                  key={index}
                  className="text-base text-[#D1D5DB] leading-relaxed font-normal"
                >
                  {part.trim()}
                </p>
              );
            }
          )}
        </div>
      );
    }

    return (
      <p className="text-base text-[#D1D5DB] leading-relaxed font-normal">
        {text}
      </p>
    );
  };

  // ==================================================
  // INITIAL LOADING SCREEN
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050709] flex flex-col items-center justify-center gap-3 text-[#7E8B9B]">

        <Loader2 className="w-7 h-7 animate-spin text-[#00C7D4]" />

        <span className="text-xs font-mono">
          Calibrating adaptive session...
        </span>

      </div>
    );
  }

  // ==================================================
  // SESSION LOAD ERROR
  // ==================================================

  if (error && !sessionInfo) {
    return (
      <div className="min-h-screen bg-[#050709] flex flex-col items-center justify-center p-6 text-center">

        <AlertCircle className="w-10 h-10 text-amber-400 mb-4" />

        <h2 className="text-xl font-bold text-white mb-2">
          Session Not Found
        </h2>

        <p className="text-sm text-[#7E8B9B] mb-6">
          {error}
        </p>

        <button
          onClick={() =>
            navigate('/sessions')
          }
          className="bg-[#00C7D4] text-[#050709] text-xs font-semibold px-4 py-2 rounded"
        >
          Return to Sessions
        </button>

      </div>
    );
  }

  // ==================================================
  // DISPLAY VALUES
  // ==================================================

  const topicName =
    sessionInfo?.topic ||
    'Session';

  const displayStrategy =
    currentStrategy
      ? currentStrategy
        .replace(/_/g, ' ')
        .toUpperCase()
      : 'VISUAL';

  // ==================================================
  // MAIN UI
  // ==================================================

  return (
    <div className="min-h-screen bg-[#050709] text-[#F3F4F6] selection:bg-[#00C7D4]/30 selection:text-white flex flex-col">

      {/* ==================================================
          SECONDARY SESSION STATUS BAR
      ================================================== */}

      <div className="sticky top-16 z-40 bg-[#090D12] border-b border-[#141C24] py-3 px-6 md:px-12 text-xs">

        <div className="max-w-4xl mx-auto flex items-center justify-between">

          {/* Topic + DNA */}

          <div className="flex items-center gap-3">

            <span className="font-bold text-white uppercase tracking-wider font-mono">
              {topicName}
            </span>

            <span className="text-[#334155]">
              •
            </span>

            <div className="flex items-center gap-1.5">

              <span className="w-1.5 h-1.5 rounded-full bg-[#00C7D4] animate-pulse" />

              <span className="text-[#00C7D4] font-mono tracking-wide">
                Learning DNA active
              </span>

            </div>

          </div>

          {/* Metrics */}

          <div className="flex items-center gap-4 font-mono">

            <div className="flex items-center gap-1.5">

              <span className="text-[#7E8B9B]">
                Understanding
              </span>

              <span className="text-white font-semibold">
                {Math.round(
                  understandingScore * 100
                )}
                %
              </span>

            </div>

            <span className="text-[#334155]">
              •
            </span>

            <div className="flex items-center gap-1.5">

              <span className="text-[#7E8B9B]">
                Friction
              </span>

              <span className="text-[#00C7D4] font-semibold">
                {getFrictionLabel(
                  frictionScore
                )}
              </span>

            </div>

          </div>

        </div>
      </div>

      {/* ==================================================
          MAIN SESSION
      ================================================== */}

      <div className="flex-1 py-12 md:py-16 px-6 max-w-2xl mx-auto w-full flex flex-col animate-fade-in">

        {/* ==================================================
            ADAPTATION NOTICE
        ================================================== */}

        {adaptedNotice && (
          <div className="mb-8 border border-[#00C7D4]/50 bg-[#00C7D4]/10 rounded-xl p-4 flex items-start gap-3 text-xs">

            <span className="mt-1 w-2 h-2 rounded-full bg-[#00C7D4] animate-ping shrink-0" />

            <div>

              <p className="font-mono font-semibold tracking-wide text-[#00C7D4]">
                ADAPT NOTICED FRICTION
              </p>

              <p className="mt-1 text-[#7E8B9B]">
                Changing the teaching approach to{' '}
                {displayStrategy.toLowerCase()}.
              </p>

            </div>

          </div>
        )}

        {/* ==================================================
            GENERATION LOADING
        ================================================== */}

        {submitting && (
          <div className="mb-8 rounded-xl border border-[#00C7D4]/20 bg-[#00C7D4]/[0.04] px-5 py-4">

            <div className="flex items-center gap-3">

              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#00C7D4]/20 bg-[#00C7D4]/10">

                <Loader2 className="h-4 w-4 animate-spin text-[#00C7D4]" />

              </div>

              <div>

                <p className="text-sm font-medium text-[#00C7D4]">
                  Please wait a moment...
                </p>

                <p className="mt-1 text-xs text-[#7E8B9B]">
                  ADAPT is analyzing your response and generating your next explanation.
                </p>

              </div>

            </div>

          </div>
        )}

        {/* ==================================================
            ERROR MESSAGE
        ================================================== */}

        {error && sessionInfo && (
          <div className="mb-8 rounded-xl border border-red-400/20 bg-red-400/[0.04] px-5 py-4">

            <div className="flex items-start gap-3">

              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />

              <div className="flex-1">

                <p className="text-sm font-medium text-red-300">
                  We couldn't generate your next lesson.
                </p>

                <p className="mt-1 text-xs text-[#7E8B9B]">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setError(null)
                  }
                  className="mt-3 text-xs text-[#94A3B8] hover:text-white transition-colors"
                >
                  Dismiss
                </button>

              </div>

            </div>

          </div>
        )}

        {/* ==================================================
            CURRENT APPROACH
        ================================================== */}

        <SectionLabel>
          CURRENT APPROACH
        </SectionLabel>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-6 uppercase">
          {displayStrategy} EXPLANATION
        </h2>

        {/* ==================================================
            AI LESSON
        ================================================== */}

        <div className="flex flex-col gap-4 text-base text-[#D1D5DB] leading-relaxed">

          {formatExplanation(
            currentLesson?.explanation
          )}

        </div>

        {/* ==================================================
            PREVIOUS EVALUATION
        ================================================== */}

        {lastEvaluation && (
          <div className="my-6 p-4 rounded-lg bg-[#0D141C] border border-[#1E2D3D] text-xs flex flex-col gap-2">

            <div className="flex items-center justify-between font-mono text-[#00C7D4]">

              <span className="font-semibold">
                ADAPT OBSERVATION
              </span>

              <span>
                Score:{' '}
                {Math.round(
                  (
                    lastEvaluation.understanding_score ||
                    0.5
                  ) * 100
                )}
                %
              </span>

            </div>

            {lastEvaluation.feedback && (
              <p className="text-[#94A3B8]">
                {lastEvaluation.feedback}
              </p>
            )}

            {lastEvaluation.misconception && (
              <p className="text-amber-400">
                Note:{' '}
                {lastEvaluation.misconception}
              </p>
            )}

          </div>
        )}

        {/* ==================================================
            NEXT QUESTION
        ================================================== */}

        <div className="my-10 border-t border-[#141C24] pt-8 flex flex-col gap-6">

          <h3 className="text-xl font-bold text-white">
            {currentLesson?.question ||
              'What happens next?'}
          </h3>

          <form
            onSubmit={
              handleSendResponse
            }
            className="flex flex-col gap-4"
          >

            {/* ==================================================
                ANSWER
            ================================================== */}

            <textarea
              value={answerText}
              onChange={(e) =>
                setAnswerText(
                  e.target.value
                )
              }
              placeholder="Type your explanation or response..."
              rows={4}
              required
              disabled={submitting}
              className="w-full bg-[#090D12] border border-[#141C24] focus:border-[#00C7D4] focus:outline-none rounded-lg p-4 text-sm text-white placeholder-[#475569] font-sans resize-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {/* ==================================================
                CONFIDENCE
            ================================================== */}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">

              <span className="text-xs text-[#7E8B9B]">
                Your confidence level:
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">

                {/* I understand */}

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    setConfidence(3)
                  }
                  className={`flex-1 sm:flex-none text-xs px-3.5 py-2 rounded-md font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${confidence === 3
                      ? 'bg-[#00C7D4] text-[#050709] font-semibold shadow-[0_0_12px_rgba(0,199,212,0.3)]'
                      : 'border border-[#141C24] text-[#7E8B9B] hover:text-white hover:border-[#1E2D3D]'
                    }`}
                >
                  I understand
                </button>

                {/* I'm unsure */}

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    setConfidence(2)
                  }
                  className={`flex-1 sm:flex-none text-xs px-3.5 py-2 rounded-md font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${confidence === 2
                      ? 'border border-[#00C7D4] text-[#00C7D4] bg-[#00C7D4]/10'
                      : 'border border-[#141C24] text-[#7E8B9B] hover:text-white hover:border-[#1E2D3D]'
                    }`}
                >
                  I'm unsure
                </button>

                {/* I don't get it */}

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    setConfidence(1)
                  }
                  className={`flex-1 sm:flex-none text-xs px-3.5 py-2 rounded-md font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${confidence === 1
                      ? 'border border-amber-400 text-amber-300 bg-amber-950/30'
                      : 'border border-[#141C24] text-[#7E8B9B] hover:text-white hover:border-amber-900/40'
                    }`}
                >
                  I don't get it
                </button>

              </div>

            </div>

            {/* ==================================================
                ACTION BUTTONS
            ================================================== */}

            <div className="pt-3 flex items-center justify-between gap-4">

              {/* Submit */}

              <button
                type="submit"
                disabled={
                  !answerText.trim() ||
                  submitting
                }
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#00C7D4] hover:bg-[#18DCE8] disabled:opacity-40 disabled:cursor-not-allowed text-[#050709] text-xs font-semibold px-6 py-3 rounded-md transition-all duration-150 active:scale-[0.98]"
              >

                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />

                    <span>
                      ADAPT is analyzing your response...
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      Submit response
                    </span>

                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}

              </button>

              {/* ==================================================
                  FINISH SESSION
              ================================================== */}

              <button
                type="button"
                disabled={submitting}
                onClick={() =>
                  navigate(
                    `/session/${sessionId}/complete`,
                    {
                      state: {
                        understandingScore,
                        frictionScore,
                        topic: topicName,

                        /*
                         * IMPORTANT:
                         * Pass the actual DNA changes returned
                         * from the backend.
                         */
                        learningDnaChanges,
                      },
                    }
                  )
                }
                className="text-xs text-[#64748B] hover:text-white border border-[#141C24] hover:border-[#1E2D3D] disabled:opacity-40 disabled:cursor-not-allowed px-4 py-3 rounded-md transition-colors whitespace-nowrap"
              >
                Finish session
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}