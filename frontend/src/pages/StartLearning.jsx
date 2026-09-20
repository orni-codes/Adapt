import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { startSession } from '../api/sessions';
import DiagnosticModal from '../components/DiagnosticModal';
import { Loader2, Sparkles, ArrowRight } from 'lucide-react';

export default function StartLearning() {
  const navigate = useNavigate();
  const { userId, profile, refreshProfile } = useAuth();
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);

  const suggestions = [
    'I want to understand recursion in Python.',
    'Explain the difference between correlation and causation.',
    'How does photosynthesis work at a molecular level?',
    'What makes a sorting algorithm efficient?',
  ];

  const handleStartSession = async (e) => {
    if (e) e.preventDefault();
    if (!topic.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const data = await startSession(topic);
      // Navigate to active session with returned session_id
      navigate(`/session/${data.session_id}`, { state: { initialData: data } });
    } catch (err) {
      console.error('Failed to start session', err);
      if (err.status === 404 && err.message?.includes('diagnostic')) {
        setError('Your Learning DNA is not calibrated yet. Complete the quick diagnostic first.');
        setDiagnosticOpen(true);
      } else {
        setError(err.message || 'Unable to start study session. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050709] text-[#F3F4F6] py-16 md:py-24 px-6 md:px-12 selection:bg-[#00C7D4]/30 selection:text-white flex flex-col items-center justify-start">
      <div className="w-full max-w-2xl flex flex-col items-start">
        {/* Status Indicator */}
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-[#00C7D4] animate-pulse" />
          <span className="text-xs font-mono tracking-wider text-[#00C7D4] uppercase font-semibold">
            Learning DNA active
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
          What do you want to
          <br />
          understand?
        </h1>

        <p className="mt-3 text-sm md:text-base text-[#7E8B9B]">
          You can ask about any topic.
        </p>

        {/* Form */}
        <form onSubmit={handleStartSession} className="w-full mt-8 flex flex-col gap-4">
          <div className="relative w-full">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="I want to understand recursion in Python."
              rows={4}
              required
              className="w-full bg-[#090D12] border border-[#141C24] focus:border-[#00C7D4] focus:outline-none rounded-lg p-5 text-base text-white placeholder-[#475569] font-sans resize-none transition-all duration-200 shadow-inner"
            />
          </div>

          {error && (
            <div className="text-xs text-amber-400 bg-amber-950/20 border border-amber-900/40 p-3 rounded flex items-center justify-between">
              <span>{error}</span>
              {error.includes('diagnostic') && (
                <button
                  type="button"
                  onClick={() => setDiagnosticOpen(true)}
                  className="underline text-[#00C7D4] ml-3 whitespace-nowrap"
                >
                  Calibrate now
                </button>
              )}
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={!topic.trim() || loading}
            className="inline-flex items-center justify-center gap-2 bg-[#00C7D4] hover:bg-[#18DCE8] disabled:opacity-50 text-[#050709] text-xs font-semibold px-6 py-3.5 rounded-md transition-all duration-150 active:scale-[0.98] shadow-[0_0_20px_rgba(0,199,212,0.2)]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing adaptive lesson...</span>
              </>
            ) : (
              <>
                <span>Start adaptive session</span>
                <span className="text-sm font-bold">→</span>
              </>
            )}
          </button>
        </form>

        {/* Suggestion Cards */}
        <div className="mt-14 w-full flex flex-col items-start">
          <span className="text-xs font-mono uppercase tracking-widest text-[#64748B] mb-4">
            Try one of these
          </span>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTopic(item)}
                className="text-left bg-[#090D12] border border-[#141C24] hover:border-[#00C7D4]/50 hover:bg-[#0D141C] rounded-lg p-4 text-xs sm:text-sm text-[#7E8B9B] hover:text-white transition-all duration-150 leading-relaxed group flex items-start justify-between"
              >
                <span>{item}</span>
                <span className="text-[#334155] group-hover:text-[#00C7D4] transition-colors ml-2">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <DiagnosticModal
        isOpen={diagnosticOpen}
        onClose={() => {
          setDiagnosticOpen(false);
          refreshProfile();
        }}
      />
    </div>
  );
}
