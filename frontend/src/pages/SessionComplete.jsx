import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getSession } from '../api/sessions';
import { useAuth } from '../context/AuthContext';
import SectionLabel from '../components/SectionLabel';
import { Loader2, ArrowRight, AlertCircle } from 'lucide-react';

export default function SessionComplete() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  /*
   * Learning DNA changes are passed from the active session.
   *
   * Example:
   * {
   *   visual_learning: 0.02,
   *   active_recall: -0.01,
   *   example_based: 0.03,
   *   teach_back: 0,
   *   passive_reading: -0.01
   * }
   */
  const [dnaChanges, setDnaChanges] = useState(
    location.state?.learningDnaChanges || null
  );

  const loadSession = async () => {
    setLoading(true);

    try {
      const data = await getSession(sessionId);

      setSession(data);

      /*
       * If the backend session endpoint also provides
       * learning_dna_changes, use them.
       */
      if (data.learning_dna_changes) {
        setDnaChanges(
          data.learning_dna_changes
        );
      }

    } catch (err) {
      console.error(
        'Failed to load session details',
        err
      );

      /*
       * Fallback to route state if available.
       */
      if (location.state) {
        setSession({
          session_id: sessionId,
          topic:
            location.state.topic ||
            'Session',

          understanding_score:
            location.state.understandingScore ??
            0.5,

          friction_score:
            location.state.frictionScore ??
            0.2,

          interactions: [],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
    refreshProfile();
  }, [sessionId]);

  // ==================================================
  // HELPERS
  // ==================================================

  const getFrictionLabel = (value = 0.2) => {
    if (value <= 0.35) {
      return 'Low';
    }

    if (value <= 0.65) {
      return 'Moderate';
    }

    return 'High';
  };

  const getRetentionLabel = (
    understanding = 0.5
  ) => {
    if (understanding >= 0.75) {
      return 'High';
    }

    if (understanding >= 0.5) {
      return 'Medium';
    }

    return 'Calibrating';
  };

  /*
   * Convert decimal change into percentage-point
   * change.
   *
   * 0.02 → +2
   * -0.04 → -4
   */
  const formatChange = (value) => {
    if (
      value === null ||
      value === undefined ||
      Number.isNaN(Number(value))
    ) {
      return null;
    }

    const percentage =
      Math.round(Number(value) * 100);

    if (percentage === 0) {
      return '0';
    }

    return percentage > 0
      ? `+${percentage}`
      : `${percentage}`;
  };

  const getChangeClass = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return 'text-[#64748B] bg-[#141C24] border-[#1E2D3D]';
    }

    const numericValue = Number(value);

    if (numericValue > 0) {
      return 'text-[#00C7D4] bg-[#00C7D4]/10 border-[#00C7D4]/30';
    }

    if (numericValue < 0) {
      return 'text-amber-400 bg-amber-400/5 border-amber-400/20';
    }

    return 'text-[#64748B] bg-[#141C24] border-[#1E2D3D]';
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050709] flex flex-col items-center justify-center gap-3 text-[#7E8B9B]">
        <Loader2 className="w-7 h-7 animate-spin text-[#00C7D4]" />

        <span className="text-xs font-mono">
          Compiling session analytics...
        </span>
      </div>
    );
  }

  // ==================================================
  // SESSION VALUES
  // ==================================================

  const understandingPct = Math.round(
    (session?.understanding_score || 0) * 100
  );

  const frictionLabel = getFrictionLabel(
    session?.friction_score
  );

  const retentionLabel =
    getRetentionLabel(
      session?.understanding_score
    );

  // ==================================================
  // STRATEGIES
  // ==================================================

  const interactions =
    session?.interactions || [];

  const workedStrategies = new Set();
  const frictionStrategies = new Set();

  interactions.forEach((interaction) => {
    const strategyName =
      interaction.strategy_used
        ? interaction.strategy_used.replace(
          /_/g,
          ' '
        )
        : 'Visual explanation';

    if (
      interaction.understanding_score >=
      0.55
    ) {
      workedStrategies.add(
        strategyName
      );
    } else {
      frictionStrategies.add(
        strategyName
      );
    }
  });

  const workedList =
    workedStrategies.size > 0
      ? Array.from(workedStrategies)
      : ['No clear winner yet'];

  const frictionList =
    frictionStrategies.size > 0
      ? Array.from(frictionStrategies)
      : ['No significant friction detected'];

  // ==================================================
  // DNA CHANGE VALUES
  // ==================================================

  const visualChange =
    dnaChanges?.visual_learning;

  const recallChange =
    dnaChanges?.active_recall;

  const exampleChange =
    dnaChanges?.example_based;

  const teachBackChange =
    dnaChanges?.teach_back;

  const passiveChange =
    dnaChanges?.passive_reading;

  /*
   * Only show dimensions that actually changed.
   */
  const dnaMetrics = [
    {
      label: 'Visual',
      value: visualChange,
    },
    {
      label: 'Recall',
      value: recallChange,
    },
    {
      label: 'Example',
      value: exampleChange,
    },
    {
      label: 'Teach-back',
      value: teachBackChange,
    },
    {
      label: 'Passive',
      value: passiveChange,
    },
  ].filter(
    (metric) =>
      metric.value !== null &&
      metric.value !== undefined &&
      Math.round(Number(metric.value) * 100) !== 0
  );

  return (
    <div className="min-h-screen bg-[#050709] text-[#F3F4F6] py-12 md:py-20 px-6 md:px-12 selection:bg-[#00C7D4]/30 selection:text-white flex flex-col items-center">

      <div className="w-full max-w-3xl flex flex-col items-start animate-fade-in">

        {/* ==================================================
            HEADER
        ================================================== */}

        <SectionLabel>
          SESSION COMPLETE
        </SectionLabel>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mt-2">
          Here's what we learned.
        </h1>

        <p className="mt-2 text-sm text-[#7E8B9B] capitalize">
          Topic:{' '}
          {session?.topic ||
            'Study Session'}
        </p>

        {/* ==================================================
            STATISTICS
        ================================================== */}

        <div className="mt-10 w-full grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Understanding */}

          <div className="bg-[#090D12] border border-[#141C24] rounded-lg p-6 flex flex-col gap-2">

            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#64748B] font-mono">
              UNDERSTANDING
            </span>

            <span className="text-2xl sm:text-3xl font-bold text-white font-mono">
              {understandingPct}%
            </span>

          </div>

          {/* Friction */}

          <div className="bg-[#090D12] border border-[#141C24] rounded-lg p-6 flex flex-col gap-2">

            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#64748B] font-mono">
              FRICTION
            </span>

            <span className="text-2xl sm:text-3xl font-bold text-[#00C7D4] font-mono">
              {frictionLabel}
            </span>

          </div>

          {/* Retention */}

          <div className="bg-[#090D12] border border-[#141C24] rounded-lg p-6 flex flex-col gap-2">

            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#64748B] font-mono">
              RETENTION
            </span>

            <span className="text-2xl sm:text-3xl font-bold text-white font-mono">
              {retentionLabel}
            </span>

          </div>

        </div>

        {/* ==================================================
            STRATEGIES
        ================================================== */}

        <div className="mt-10 w-full grid grid-cols-1 sm:grid-cols-2 gap-8 border-y border-[#141C24]/60 py-8">

          {/* Worked */}

          <div className="flex flex-col items-start gap-4">

            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#00C7D4] font-mono">
              STRATEGIES THAT WORKED
            </span>

            <ul className="flex flex-col gap-2.5 text-sm text-[#D1D5DB]">

              {workedList.map(
                (item, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2.5 capitalize"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00C7D4]" />

                    <span>
                      {item}
                    </span>
                  </li>
                )
              )}

            </ul>

          </div>

          {/* Didn't work */}

          <div className="flex flex-col items-start gap-4">

            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#64748B] font-mono">
              STRATEGY THAT DIDN'T WORK
            </span>

            <ul className="flex flex-col gap-2.5 text-sm text-[#7E8B9B]">

              {frictionList.map(
                (item, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2.5 capitalize"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#475569]" />

                    <span>
                      {item}
                    </span>
                  </li>
                )
              )}

            </ul>

          </div>

        </div>

        {/* ==================================================
            LEARNING DNA UPDATED
        ================================================== */}

        <div className="mt-8 w-full bg-[#090D12] border border-[#00C7D4]/40 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-[0_0_25px_rgba(0,199,212,0.06)]">

          {/* Message */}

          <div className="flex items-center gap-4">

            <div className="w-10 h-10 rounded-lg bg-[#00C7D4]/10 border border-[#00C7D4]/30 flex items-center justify-center text-[#00C7D4] flex-shrink-0">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5"
              >
                <path d="M2 15c6.667-6 13.333 0 20-6" />
                <path d="M9 22c1.8-2 2.5-4 2.8-6" />
                <path d="M15 2c-1.8 2-2.5 4-2.8 6" />
                <path d="M17 6l-2.5-2.5" />
                <path d="M14 8l-1-1" />
                <path d="M7 18l2.5 2.5" />
              </svg>

            </div>

            <div className="flex flex-col">

              <span className="text-xs font-semibold tracking-wider text-[#00C7D4] uppercase font-mono">
                YOUR LEARNING DNA HAS BEEN UPDATED.
              </span>

              <p className="text-xs text-[#7E8B9B] mt-1">
                ADAPT adjusted your learning model based on this session.
              </p>

            </div>

          </div>

          {/* ==================================================
              REAL DNA CHANGES
          ================================================== */}

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">

            {dnaMetrics.length > 0 ? (
              dnaMetrics.map(
                (metric) => (
                  <span
                    key={metric.label}
                    className={`px-2.5 py-1 rounded border ${getChangeClass(
                      metric.value
                    )}`}
                  >
                    {metric.label}{' '}
                    {formatChange(
                      metric.value
                    )}
                  </span>
                )
              )
            ) : (
              <span className="text-[#64748B] bg-[#141C24] px-2.5 py-1 rounded border border-[#1E2D3D]">
                No significant changes
              </span>
            )}

          </div>

        </div>

        {/* ==================================================
            COMPLETION ACTIONS
        ================================================== */}

        <div className="mt-10 flex flex-wrap items-center gap-4 w-full">

          <button
            onClick={() =>
              navigate('/learn')
            }
            className="inline-flex items-center justify-center gap-2 bg-[#00C7D4] hover:bg-[#18DCE8] text-[#050709] text-xs font-semibold px-6 py-3 rounded-md transition-all duration-150 active:scale-[0.98] shadow-[0_0_15px_rgba(0,199,212,0.2)]"
          >
            <span>
              Continue learning
            </span>

            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() =>
              navigate('/learning-dna')
            }
            className="border border-[#141C24] hover:border-[#00C7D4]/60 bg-[#090D12] text-white text-xs font-medium px-5 py-3 rounded-md transition-colors"
          >
            View Learning DNA
          </button>

        </div>

      </div>
    </div>
  );
}