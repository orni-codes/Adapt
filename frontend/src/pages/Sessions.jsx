import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserHistory } from '../api/history';
import SectionLabel from '../components/SectionLabel';
import { BookOpen, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function Sessions() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadHistory();
  }, [userId]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserHistory(userId);
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load session history', err);
      setError(err.message || 'Unable to connect to history endpoint.');
    } finally {
      setLoading(false);
    }
  };

  // Group sessions by relative date bucket
  const groupSessionsByDate = (list) => {
    const groups = {};

    list.forEach((session) => {
      let groupKey = 'PAST SESSIONS';
      if (session.created_at) {
        const sessionDate = new Date(session.created_at);
        const now = new Date();
        const diffDays = Math.floor((now - sessionDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) groupKey = 'TODAY';
        else if (diffDays === 1) groupKey = 'YESTERDAY';
        else if (diffDays <= 7) groupKey = `${diffDays} DAYS AGO`;
        else groupKey = sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
      }

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(session);
    });

    return groups;
  };

  const grouped = groupSessionsByDate(sessions);

  const getFrictionLabel = (score = 0) => {
    if (score <= 0.35) return { label: 'Low friction', color: 'text-[#00C7D4] border-[#00C7D4]/30' };
    if (score <= 0.65) return { label: 'Moderate friction', color: 'text-amber-400 border-amber-400/30' };
    return { label: 'High friction', color: 'text-red-400 border-red-400/30' };
  };

  return (
    <div className="min-h-screen bg-[#050709] text-[#F3F4F6] py-12 md:py-20 px-6 md:px-12 selection:bg-[#00C7D4]/30 selection:text-white">
      <div className="max-w-5xl mx-auto flex flex-col">
        {/* Header */}
        <div className="flex flex-col items-start border-b border-[#141C24]/60 pb-10">
          <SectionLabel>LEARNING HISTORY</SectionLabel>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mt-2">
            Your learning journey.
          </h1>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-28 flex flex-col items-center justify-center gap-3 text-[#7E8B9B]">
            <Loader2 className="w-6 h-6 animate-spin text-[#00C7D4]" />
            <span className="text-xs font-mono">Loading your learning history...</span>
          </div>
        ) : error ? (
          <div className="py-20 flex flex-col items-center text-center max-w-md mx-auto">
            <AlertCircle className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">History Unavailable</h3>
            <p className="text-xs text-[#7E8B9B] mb-6">{error}</p>
            <button
              onClick={loadHistory}
              className="border border-[#141C24] hover:border-[#00C7D4] text-xs font-semibold px-4 py-2 rounded text-white transition-colors"
            >
              Retry
            </button>
          </div>
        ) : sessions.length === 0 ? (
          /* Graceful empty state */
          <div className="py-24 flex flex-col items-center text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full border border-[#141C24] bg-[#090D12] flex items-center justify-center text-[#7E8B9B] mb-4">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Sessions Yet</h3>
            <p className="text-sm text-[#7E8B9B] mb-6">
              Start your first adaptive learning session to begin building your personalized learning history.
            </p>
            <button
              onClick={() => navigate('/learn')}
              className="bg-[#00C7D4] hover:bg-[#18DCE8] text-[#050709] text-xs font-semibold px-5 py-2.5 rounded-md transition-colors"
            >
              Start Learning →
            </button>
          </div>
        ) : (
          /* Grouped Sessions List */
          <div className="py-12 flex flex-col gap-12">
            {Object.entries(grouped).map(([dateGroup, items]) => (
              <div key={dateGroup} className="flex flex-col gap-4">
                {/* Date Header */}
                <div className="text-xs font-semibold tracking-[0.2em] font-mono text-[#64748B] uppercase">
                  {dateGroup}
                </div>

                {/* Session Cards */}
                <div className="flex flex-col gap-3">
                  {items.map((session) => {
                    const understandingPct = Math.round((session.understanding_score || 0) * 100);
                    const friction = getFrictionLabel(session.friction_score);

                    return (
                      <div
                        key={session.session_id}
                        onClick={() => navigate(`/session/${session.session_id}`)}
                        className="bg-[#090D12] border border-[#141C24] hover:border-[#00C7D4]/40 rounded-lg p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-[0_0_20px_rgba(0,199,212,0.06)]"
                      >
                        {/* Left: Topic & Understanding */}
                        <div className="flex flex-col gap-1.5">
                          <h3 className="text-base md:text-lg font-semibold text-white group-hover:text-[#00C7D4] transition-colors capitalize">
                            {session.topic}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-[#7E8B9B] font-mono">
                            <span className="text-[#00C7D4] font-medium">
                              {understandingPct}% understanding
                            </span>
                            <span>•</span>
                            <span className="text-[#64748B]">Session #{session.session_id}</span>
                          </div>
                        </div>

                        {/* Right: Badges, Strategy Flow, and Arrow */}
                        <div className="flex items-center gap-4 text-xs">
                          {/* Friction badge */}
                          <div className={`px-2.5 py-1 rounded border font-mono text-[11px] ${friction.color} bg-black/30`}>
                            {friction.label}
                          </div>

                          {/* Arrow indicator */}
                          <div className="w-8 h-8 rounded-full border border-[#141C24] flex items-center justify-center text-[#7E8B9B] group-hover:text-white group-hover:border-[#00C7D4]/60 transition-colors">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
