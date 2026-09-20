import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getDiagnosticQuestions,
  submitDiagnosticAnswer,
  completeDiagnostic,
} from '../api/learningDNA';
import { startSession } from '../api/sessions';
import {
  X,
  ArrowRight,
  Loader2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import SectionLabel from './SectionLabel';

// Suggested topics shown on the topic-selection screen
const SUGGESTED_TOPICS = [
  'Programming',
  'Mathematics',
  'Physics',
  'Biology',
  'History',
  'English',
  'Machine Learning',
  'Data Structures',
  'Web Development',
  'Calculus',
];

// Step constants
const STEP_TOPIC = 'topic';
const STEP_QUESTIONS = 'questions';
const STEP_COMPLETE = 'complete';

export default function DiagnosticModal({ isOpen, onClose, initialTopic = '' }) {
  const navigate = useNavigate();
  const { userId, refreshProfile } = useAuth();

  // ── Step state ───────────────────────────────────────────────────────────
  const [step, setStep] = useState(STEP_TOPIC);

  // ── Topic selection ──────────────────────────────────────────────────────
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [customTopic, setCustomTopic] = useState('');

  // ── Questions ────────────────────────────────────────────────────────────
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [confidence, setConfidence] = useState(3);
  const [hintUsed] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // ── Complete state ───────────────────────────────────────────────────────
  const [finalProfile, setFinalProfile] = useState(null);
  const [startingSession, setStartingSession] = useState(false);

  // Reset whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(STEP_TOPIC);
      setSelectedTopic(initialTopic || '');
      setCustomTopic('');
      setCurrentIndex(0);
      setAnswerText('');
      setConfidence(3);
      setFinalProfile(null);
      setStartingSession(false);
    }
  }, [isOpen, initialTopic]);

  if (!isOpen) return null;

  // ── Derived helpers ──────────────────────────────────────────────────────
  const activeTopic = (customTopic.trim() || selectedTopic).trim();
  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex >= questions.length - 1;
  const progress = questions.length > 0
    ? Math.round(((currentIndex) / questions.length) * 100)
    : 0;

  // ── Topic confirmed → load questions ────────────────────────────────────
  const handleTopicConfirm = async () => {
    if (!activeTopic) return;
    setLoadingQuestions(true);
    try {
      const data = await getDiagnosticQuestions(activeTopic);
      setQuestions(data.questions || []);
      setCurrentIndex(0);
      setAnswerText('');
      setStartTime(Date.now());
      setStep(STEP_QUESTIONS);
    } catch (err) {
      console.error('Failed to load diagnostic questions', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // ── Submit one answer ────────────────────────────────────────────────────
  const handleNextOrSubmit = async () => {
    if (!answerText.trim() || submitting) return;
    setSubmitting(true);
    const responseTime = Math.max((Date.now() - startTime) / 1000, 1.0);

    try {
      await submitDiagnosticAnswer({
        userId,
        questionId: currentQ.id,
        answer: answerText,
        responseTime,
        confidence,
        hintUsed,
      });

      if (isLastQuestion) {
        // All questions done — build initial DNA
        const result = await completeDiagnostic(userId, activeTopic);
        await refreshProfile();
        setFinalProfile(result?.profile || null);
        setStep(STEP_COMPLETE);
      } else {
        setCurrentIndex((prev) => prev + 1);
        setAnswerText('');
        setConfidence(3);
        setStartTime(Date.now());
      }
    } catch (err) {
      console.error('Error submitting answer', err);
      // Even on error, advance — resilient MVP behaviour
      if (isLastQuestion) {
        await refreshProfile();
        setStep(STEP_COMPLETE);
      } else {
        setCurrentIndex((prev) => prev + 1);
        setAnswerText('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── After DNA complete: start study session with the chosen topic ─────
  const handleStartLearning = async () => {
    setStartingSession(true);
    try {
      const data = await startSession(activeTopic);
      onClose();
      navigate(`/session/${data.session_id}`, { state: { initialData: data } });
    } catch (err) {
      console.error('Failed to start session', err);
      // Fall back to learning-dna page
      onClose();
      navigate('/learning-dna');
    }
  };

  const handleViewDNA = () => {
    onClose();
    navigate('/learning-dna');
  };

  // ── Percentage formatter ─────────────────────────────────────────────────
  const pct = (val) => `${Math.round((val || 0.5) * 100)}%`;

  // ── DNA dimension labels ─────────────────────────────────────────────────
  const dnaLabels = [
    { key: 'visual_learning', label: 'Visual learning' },
    { key: 'example_based', label: 'Learning by examples' },
    { key: 'active_recall', label: 'Active recall' },
    { key: 'teach_back', label: 'Teach-back ability' },
    { key: 'passive_reading', label: 'Structured reading' },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-xl bg-[#090D12] border border-[#141C24] rounded-xl shadow-2xl relative overflow-hidden">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#7E8B9B] hover:text-white p-1 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── STEP 0: TOPIC SELECTION ─────────────────────────────────── */}
        {step === STEP_TOPIC && (
          <div className="p-6 md:p-8 flex flex-col gap-6">
            <div>
              <SectionLabel>LEARNING CALIBRATION</SectionLabel>
              <h2 className="text-xl md:text-2xl font-bold text-white mt-2 leading-snug">
                Let's figure out how learning<br />works best for you.
              </h2>
              <p className="text-sm text-[#7E8B9B] mt-2">
                First, choose a topic you actually want to learn. ADAPT will
                use it to discover your learning style through a short
                behavioral check-in — not a test.
              </p>
            </div>

            {/* Topic grid */}
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#64748B] mb-3 block">
                Choose a subject
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SUGGESTED_TOPICS.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setSelectedTopic(t);
                      setCustomTopic('');
                    }}
                    className={`text-xs px-3 py-2.5 rounded-lg border text-left transition-all duration-150 ${selectedTopic === t && !customTopic
                        ? 'border-[#00C7D4] text-[#00C7D4] bg-[#00C7D4]/10 font-semibold'
                        : 'border-[#141C24] text-[#7E8B9B] hover:text-white hover:border-[#1E2D3D]'
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Or type custom topic */}
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#64748B] mb-2 block">
                Or enter your own
              </span>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => {
                  setCustomTopic(e.target.value);
                  if (e.target.value) setSelectedTopic('');
                }}
                placeholder="e.g. Photosynthesis, React, World War II…"
                className="w-full bg-[#050709] border border-[#141C24] focus:border-[#00C7D4] focus:outline-none rounded-lg px-4 py-3 text-sm text-white placeholder-[#475569] transition-colors"
              />
            </div>

            {/* Active topic preview */}
            {activeTopic && (
              <p className="text-xs text-[#00C7D4] font-mono">
                ✓ Topic selected:{' '}
                <span className="font-semibold">{activeTopic}</span>
              </p>
            )}

            <button
              onClick={handleTopicConfirm}
              disabled={!activeTopic || loadingQuestions}
              className="w-full flex items-center justify-center gap-2 bg-[#00C7D4] hover:bg-[#18DCE8] disabled:opacity-50 text-[#050709] font-semibold text-xs py-3.5 rounded-lg transition-colors"
            >
              {loadingQuestions ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing calibration…</span>
                </>
              ) : (
                <>
                  <span>Start learning calibration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* ── STEP 1: QUESTIONS ──────────────────────────────────────────── */}
        {step === STEP_QUESTIONS && currentQ && (
          <div className="p-6 md:p-8 flex flex-col gap-5">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <SectionLabel>LEARNING CALIBRATION</SectionLabel>
                <span className="text-xs font-mono text-[#64748B]">
                  {currentIndex + 1} / {questions.length}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-0.5 bg-[#141C24] rounded-full mt-2">
                <div
                  className="h-0.5 bg-[#00C7D4] rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs font-mono text-[#00C7D4] uppercase tracking-wider">
                  {currentQ.type.replace('_', ' ')}
                </span>
                <span className="text-[#334155]">•</span>
                <span className="text-xs text-[#64748B] font-mono">
                  {activeTopic}
                </span>
              </div>
            </div>

            {/* Question */}
            <div>
              <h3 className="text-base md:text-lg font-bold text-white leading-relaxed whitespace-pre-line">
                {currentQ.question}
              </h3>
            </div>

            {/* Answer textarea */}
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Type your answer here…"
              rows={4}
              className="w-full bg-[#050709] border border-[#141C24] focus:border-[#00C7D4] focus:outline-none rounded-lg p-4 text-sm text-white placeholder-[#475569] font-sans resize-none transition-colors"
            />

            {/* Confidence selector */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#7E8B9B]">Confidence:</span>
              <div className="flex gap-2">
                {[
                  { label: 'Low', val: 1 },
                  { label: 'Medium', val: 2 },
                  { label: 'High', val: 3 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setConfidence(item.val)}
                    className={`text-xs px-3 py-1.5 rounded border transition-colors ${confidence === item.val
                        ? 'border-[#00C7D4] text-[#00C7D4] bg-[#00C7D4]/10'
                        : 'border-[#141C24] text-[#7E8B9B] hover:text-white'
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Next / Complete */}
            <button
              onClick={handleNextOrSubmit}
              disabled={!answerText.trim() || submitting}
              className="w-full flex items-center justify-center gap-2 bg-[#00C7D4] hover:bg-[#18DCE8] disabled:opacity-50 text-[#050709] font-semibold text-xs py-3 rounded-lg transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating response…</span>
                </>
              ) : isLastQuestion ? (
                <>
                  <span>Build my Learning DNA</span>
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Next question</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* ── STEP 2: COMPLETE — Show DNA summary ────────────────────────── */}
        {step === STEP_COMPLETE && (
          <div className="p-6 md:p-8 flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#00C7D4] mt-0.5 shrink-0" />
              <div>
                <SectionLabel>YOUR INITIAL LEARNING DNA</SectionLabel>
                <h2 className="text-xl font-bold text-white mt-1">
                  Calibration complete.
                </h2>
                <p className="text-xs text-[#7E8B9B] mt-1">
                  Based on how you responded, ADAPT has estimated your initial
                  learning profile for{' '}
                  <span className="text-white font-semibold">{activeTopic}</span>.
                </p>
              </div>
            </div>

            {/* DNA bars */}
            {finalProfile && (
              <div className="flex flex-col gap-3">
                {dnaLabels.map(({ key, label }) => {
                  const value = finalProfile[key] ?? 0.5;
                  const width = Math.round(value * 100);
                  return (
                    <div key={key} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#94A3B8]">{label}</span>
                        <span className="font-mono text-[#00C7D4] font-semibold">
                          {width}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#141C24] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#00C7D4] to-[#00A3AD] rounded-full transition-all duration-700"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {finalProfile.preferred_strategy && (
                  <p className="text-xs font-mono text-[#64748B] mt-1">
                    Preferred starting strategy:{' '}
                    <span className="text-[#00C7D4] font-semibold capitalize">
                      {finalProfile.preferred_strategy.replace(/_/g, ' ')}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-[11px] text-[#475569] leading-relaxed border-l-2 border-[#141C24] pl-3">
              These are not fixed labels. ADAPT will continue learning from how
              you respond during real study sessions.
            </p>

            {/* CTAs */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleStartLearning}
                disabled={startingSession}
                className="w-full flex items-center justify-center gap-2 bg-[#00C7D4] hover:bg-[#18DCE8] disabled:opacity-50 text-[#050709] font-semibold text-xs py-3.5 rounded-lg transition-colors"
              >
                {startingSession ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Starting session…</span>
                  </>
                ) : (
                  <>
                    <span>Start learning {activeTopic}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                onClick={handleViewDNA}
                className="w-full text-xs text-[#64748B] hover:text-white py-2.5 rounded-lg border border-[#141C24] hover:border-[#1E2D3D] transition-colors"
              >
                View full Learning DNA →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
