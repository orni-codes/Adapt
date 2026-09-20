import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SectionLabel from '../components/SectionLabel';
import ProgressBar from '../components/ProgressBar';
import DNAVisualization from '../components/DNAVisualization';
import DiagnosticModal from '../components/DiagnosticModal';
import { Sparkles, RefreshCw } from 'lucide-react';

export default function LearningDNA() {
  const navigate = useNavigate();
  const { profile, loadingProfile, refreshProfile } = useAuth();
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);

  // Map backend learning profile fields to display dimensions
  const dimensions = profile
    ? [
        { label: 'Visual reasoning', value: Math.round((profile.visual_learning ?? 0.5) * 100) },
        { label: 'Active recall', value: Math.round((profile.active_recall ?? 0.5) * 100) },
        { label: 'Example-based learning', value: Math.round((profile.example_based ?? 0.5) * 100) },
        { label: 'Teach-back', value: Math.round((profile.teach_back ?? 0.5) * 100) },
        { label: 'Passive reading', value: Math.round((profile.passive_reading ?? 0.5) * 100) },
      ]
    : [];

  // Determine current learning pattern pills based on backend preferred_strategy or top dimensions
  const getPatternPills = () => {
    if (!profile) return ['VISUAL', 'EXAMPLE', 'RETRIEVAL'];
    const pills = [];
    if (profile.preferred_strategy) {
      pills.push(profile.preferred_strategy.toUpperCase());
    }
    if ((profile.visual_learning || 0) >= 0.5 && !pills.includes('VISUAL')) pills.push('VISUAL');
    if ((profile.example_based || 0) >= 0.5 && !pills.includes('EXAMPLE')) pills.push('EXAMPLE');
    if ((profile.active_recall || 0) >= 0.5 && !pills.includes('RETRIEVAL')) pills.push('RETRIEVAL');
    if ((profile.teach_back || 0) >= 0.6 && !pills.includes('TEACH-BACK')) pills.push('TEACH-BACK');
    return pills.slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-[#050709] text-[#F3F4F6] py-10 md:py-10 px-6 md:px-12 selection:bg-[#00C7D4]/30 selection:text-white">
      <div className="max-w-5xl mx-auto flex flex-col">
        {/* Header */}
        <div className="flex flex-col items-start border-b border-[#141C24]/60 pb-2">
          <SectionLabel>YOUR LEARNING DNA</SectionLabel>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mt-2">
            This is how you learn best.
          </h1>

          <p className="mt-4 text-base text-[#7E8B9B]">
            A living model built from your interactions.
          </p>
        </div>

        {/* Main Content Area */}
        {loadingProfile ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-[#7E8B9B]">
            <RefreshCw className="w-6 h-6 animate-spin text-[#00C7D4]" />
            <span className="text-xs font-mono">Retrieving Learning DNA model...</span>
          </div>
        ) : !profile ? (
          /* Graceful empty state */
          <div className="py-20 flex flex-col items-center text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full border border-[#00C7D4]/40 bg-[#00C7D4]/5 flex items-center justify-center text-[#00C7D4] mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Learning Profile Found</h3>
            <p className="text-sm text-[#7E8B9B] mb-6">
              Complete the quick behavioral diagnostic assessment to generate your personalized Learning DNA.
            </p>
            <button
              onClick={() => setDiagnosticOpen(true)}
              className="bg-[#00C7D4] hover:bg-[#18DCE8] text-[#050709] text-xs font-semibold px-5 py-2.5 rounded-md transition-colors"
            >
              Take Diagnostic Now →
            </button>
          </div>
        ) : (
          <div className="py-10 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-10 items-center">
            {/* Left: Large Animated DNA Visualization */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="flex items-center justify-center">
                <DNAVisualization width={450} height={630} />
              </div>
            </div>

            {/* Right: Learning Dimensions */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <span className="text-xl font-semibold tracking-[0.2em] uppercase text-[#62748d] mb-2 font-mono">
                COGNITIVE DIMENSIONS
              </span>

              {dimensions.map((dim) => (
                <ProgressBar
                  key={dim.label}
                  label={dim.label}
                  value={dim.value}
                />
              ))}

              <div className="pt-4 flex items-center justify-between text-sm text-[#64748B] font-mono border-t border-[#141C24]/60">
                <span>PRIMARY STRATEGY:</span>
                <span className="text-[#00C7D4] uppercase font-semibold">
                  {profile.preferred_strategy || 'Adaptive'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Learning DNA Insights */}
        {profile && (
          <div className="border-t border-[#141C24]/60 pt-12 flex flex-col gap-12">
            {/* What Works For You */}
            <div className="flex flex-col items-start max-w-3xl">
              <SectionLabel>WHAT WORKS FOR YOU</SectionLabel>
              <p className="text-lg sm:text-xl text-[#F3F4F6] font-normal leading-relaxed mt-2">
                You retain concepts better when you can see relationships and immediately apply them.
                Examples before theory. Retrieval before review.
              </p>
            </div>

            {/* What Creates Friction */}
            <div className="flex flex-col items-start max-w-3xl">
              <span className="text-[12px] font-semibold tracking-[0.2em] uppercase text-[#64748B] mb-3">
                WHAT CREATES FRICTION
              </span>
              <p className="text-lg sm:text-xl text-[#7E8B9B] font-normal leading-relaxed">
                Long passive explanations cause your attention and recall to drop. Your engagement
                falls measurably after unbroken reading segments exceeding 3 minutes.
              </p>
            </div>

            {/* Your Current Learning Pattern */}
            <div className="flex flex-col items-start">
              <span className="text-[12px] font-semibold tracking-[0.2em] uppercase text-[#64748B] mb-4">
                YOUR CURRENT LEARNING PATTERN
              </span>
              <div className="flex flex-wrap gap-3">
                {getPatternPills().map((pill) => (
                  <div
                    key={pill}
                    className="bg-[#090D12] border border-[#00C7D4]/40 px-4 py-2 rounded-xl text-sm font-mono tracking-wider font-semibold text-[#00C7D4]"
                  >
                    {pill}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="border-t border-[#141C24]/60 pt-12 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <p className="text-sm text-[#7E8B9B]">
                Your Learning DNA changes as ADAPT learns from your sessions.
              </p>

              <button
                onClick={() => navigate('/learn')}
                className="inline-flex items-center gap-2 bg-[#00C7D4] hover:bg-[#18DCE8] text-[#050709] text-xs font-semibold px-5 py-3 rounded-md transition-all duration-150 active:scale-[0.98] shadow-[0_0_15px_rgba(0,199,212,0.2)]"
              >
                <span>Start a learning session</span>
                <span className="font-bold">→</span>
              </button>
            </div>
          </div>
        )}
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
