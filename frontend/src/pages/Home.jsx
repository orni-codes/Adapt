import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionLabel from '../components/SectionLabel';
import DNAVisualization from '../components/DNAVisualization';
import DiagnosticModal from '../components/DiagnosticModal';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [diagnosticOpen, setDiagnosticOpen] = useState(false);
  const [hoveredStep, setHoveredStep] = useState(null);

  const handleDiscoverDNA = () => {
    if (profile) {
      navigate('/learning-dna');
    } else {
      setDiagnosticOpen(true);
    }
  };

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const loopSteps = [
    {
      num: '01',
      title: 'DISCOVER',
      desc: 'ADAPT observes how you understand and retain information through targeted behavioral diagnostics.',
    },
    {
      num: '02',
      title: 'BUILD YOUR LEARNING DNA',
      desc: 'Your interactions reveal the teaching strategies that work specifically for how you think.',
    },
    {
      num: '03',
      title: 'ADAPT IN REAL TIME',
      desc: 'Explanations, examples, questions, and difficulty shift based on how you respond.',
    },
    {
      num: '04',
      title: 'LEARN OVER TIME',
      desc: 'Every session gives ADAPT more precision. The model doesn\'t reset — it evolves.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#050709] text-[#F3F4F6] selection:bg-[#00C7D4]/30 selection:text-white">
      {/* ================================================== */}
      {/* 1. HERO SECTION (Screenshot 1)                     */}
      {/* ================================================== */}
      <section className="relative pt-12 md:pt-20 md:pb-36 px-6 md:px-12 border-b border-[#141C24]/60 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left z-10">
            <SectionLabel>AI THAT LEARNS HOW YOU LEARN</SectionLabel>

            <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-bold tracking-[-0.03em] leading-[1.1] text-white mt-4">
              Stop studying
              <br />
              harder.
              <br />
              <span className="text-[#64748B]">
                Start studying your
                <br />
                way.
              </span>
            </h1>

            <p className="mt-8 text-base md:text-lg text-[#7E8B9B] max-w-xl leading-relaxed">
              ADAPT discovers how you understand, where you struggle, and which teaching strategies work best for you.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <button
                onClick={handleDiscoverDNA}
                className="inline-flex items-center gap-2.5 bg-[#00C7D4] hover:bg-[#18DCE8] text-[#050709] text-sm font-semibold px-6 py-3 rounded-md transition-all duration-150 active:scale-[0.98] shadow-[0_0_20px_rgba(0,199,212,0.25)]"
              >
                <span>Discover my Learning DNA</span>
                <span className="text-base font-bold">→</span>
              </button>

              <button
                onClick={scrollToHowItWorks}
                className="text-sm font-medium text-[#7E8B9B] hover:text-white transition-colors duration-150 py-2 focus:outline-none"
              >
                See how it works
              </button>
            </div>
          </div>

          {/* Right Column: Stylized DNA Visualization */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            {/* Subtle background glow circle */}
            <div className="absolute w-82 h-82 rounded-full bg-[#00C7D4]/5 blur-3xl pointer-events-none -z-0" />
            <DNAVisualization width={400} height={570} />
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 2. THE REAL BARRIER (Screenshot 2)                 */}
      {/* ================================================== */}
      <section id="how-it-works" className="py-20 px-6 md:px-12 border-b border-[#141C24]/60">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <SectionLabel>THE REAL BARRIER</SectionLabel>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight mt-3">
              The problem isn't
              <br />
              always motivation.
            </h2>

            <p className="mt-6 text-base md:text-lg text-[#7E8B9B] max-w-xl leading-relaxed">
              Sometimes you're simply trying to learn in a way that doesn't work for you.
            </p>

            {/* Cyan Border Callout Box */}
            <div className="mt-8 border border-[#00C7D4]/40 bg-[#00C7D4]/5 rounded-md px-6 py-5 max-w-lg shadow-[0_0_20px_rgba(0,199,212,0.06)]">
              <p className="text-sm md:text-base font-medium text-[#00C7D4] leading-snug">
                ADAPT breaks the loop by changing the way you're taught.
              </p>
            </div>
          </div>

          {/* Right Column: Vertical Progression Editorial Flow */}
          <div className="lg:col-span-5 flex flex-col items-start lg:items-center justify-center">
            <div className="flex flex-col items-center gap-3 font-mono tracking-widest text-sm select-none">
              {/* CONFUSION (bright) */}
              <div className="text-white font-semibold tracking-[0.25em] text-sm hover:text-[#00C7D4] transition-colors cursor-default">
                CONFUSION
              </div>
              <span className="text-[#5a697e] text-sm">↓</span>

              {/* FRUSTRATION */}
              <div className="text-[#5a697e] hover:text-white transition-colors duration-200 cursor-default">
                FRUSTRATION
              </div>
              <span className="text-[#5a697e] text-sm">↓</span>

              {/* BOREDOM */}
              <div className="text-[#5a697e] hover:text-white transition-colors duration-200 cursor-default">
                BOREDOM
              </div>
              <span className="text-[#5a697e] text-sm">↓</span>

              {/* DISTRACTION */}
              <div className="text-[#5a697e] hover:text-white transition-colors duration-200 cursor-default">
                DISTRACTION
              </div>
              <span className="text-[#5a697e] text-sm">↓</span>

              {/* GUILT (bright) */}
              <div className="text-white font-semibold tracking-[0.25em] text-sm hover:text-[#00C7D4] transition-colors cursor-default">
                GUILT
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 3. PERSONALIZATION SECTION (Screenshot 3)          */}
      {/* ================================================== */}
      <section className="py-24 md:py-36 px-6 md:px-12 border-b border-[#141C24]/60">
        <div className="max-w-7xl mx-auto flex flex-col items-start">
          <SectionLabel>A DIFFERENT KIND OF PERSONALIZATION</SectionLabel>

          <h2 className="text-3xl sm:text-4xl lg:text-4xl font-bold text-white mt-3 leading-tight col-span-1 lg:col-span-7 lg:leading-[1.15]">
            Most platforms personalize what
            <br />
            you study.
            <br />
            <span className="text-[#64748B]">
              ADAPT personalizes how you
              <br />
              learn.
            </span>
          </h2>

          {/* Comparison Cards */}
          <div className="mt-14 w-full grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            {/* Left Card: TRADITIONAL AI TUTOR (Dim) */}
            <div className="bg-[#090D12] border border-[#141C24] rounded-lg p-8 flex flex-col items-start opacity-70 hover:opacity-90 transition-opacity">
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#64748B] mb-8">
                TRADITIONAL AI TUTOR
              </span>

              <div className="flex flex-col items-start gap-4 text-sm text-[#7E8B9B] font-mono">
                <span>Content</span>
                <span className="text-[#334155] text-xs">↓</span>
                <span>Questions</span>
                <span className="text-[#334155] text-xs">↓</span>
                <span>Score</span>
                <span className="text-[#334155] text-xs">↓</span>
                <span>Repeat</span>
              </div>
            </div>

            {/* Right Card: ADAPT (Active, Cyan Border & Glow) */}
            <div className="bg-[#090D12] border border-[#00C7D4]/50 rounded-lg p-8 flex flex-col items-start shadow-[0_0_25px_rgba(0,199,212,0.08)] relative group">
              {/* Subtle active indicator dot */}
              <div className="absolute top-6 right-6 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C7D4] animate-pulse" />
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#00C7D4]">ACTIVE</span>
              </div>

              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#00C7D4] mb-8">
                ADAPT
              </span>

              <div className="flex flex-col items-start gap-3.5 text-sm text-white font-mono">
                <span className="font-semibold text-[#F3F4F6]">Learner</span>
                <span className="text-[#00C7D4]/50 text-xs">↓</span>
                <span className="text-[#F3F4F6]">Learning pattern</span>
                <span className="text-[#00C7D4]/50 text-xs">↓</span>
                <span className="text-[#F3F4F6]">Teaching strategy</span>
                <span className="text-[#00C7D4]/50 text-xs">↓</span>
                <span className="text-[#F3F4F6]">Observe</span>
                <span className="text-[#00C7D4]/50 text-xs">↓</span>
                <span className="text-[#00C7D4] font-medium">Adapt</span>
                <span className="text-[#00C7D4]/50 text-xs">↓</span>
                <span className="text-[#00C7D4] font-semibold">Improve</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 4. THE CORE LOOP (Screenshot 4)                    */}
      {/* ================================================== */}
      <section className="py-2 px-6 md:px-12 border-b border-[#141C24]/60">
        <div className="max-w-7xl mx-auto flex flex-col items-start">
          <SectionLabel>THE CORE LOOP</SectionLabel>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight mt-3 mb-16">
            Built to evolve.
          </h2>

          {/* Vertical Timeline */}
          <div className="relative flex flex-col gap-12 max-w-2xl">
            {/* Continuous Vertical Line */}
            <div className="absolute left-5 top-4 bottom-4 w-[1px] bg-[#141C24]" />

            {loopSteps.map((step, idx) => {
              const isHovered = hoveredStep === idx;
              const isFirst = idx === 0;

              return (
                <div
                  key={step.num}
                  onMouseEnter={() => setHoveredStep(idx)}
                  onMouseLeave={() => setHoveredStep(null)}
                  className="relative flex items-start gap-8 group"
                >
                  {/* Numbered Circular Node */}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-mono text-xs font-semibold transition-all duration-300 ${
                      isFirst || isHovered
                        ? 'bg-[#050709] border border-[#00C7D4] text-[#00C7D4] shadow-[0_0_15px_rgba(0,199,212,0.3)]'
                        : 'bg-[#050709] border border-[#1E2D3D] text-[#64748B] group-hover:border-[#00C7D4]/60 group-hover:text-white'
                    }`}
                  >
                    {step.num}
                  </div>

                  {/* Step Content */}
                  <div className="flex flex-col gap-2 pt-1.5">
                    <span
                      className={`text-xs font-semibold tracking-[0.2em] uppercase transition-colors duration-200 ${
                        isFirst || isHovered
                          ? 'text-[#00C7D4]'
                          : 'text-[#7E8B9B] group-hover:text-white'
                      }`}
                    >
                      {step.title}
                    </span>
                    <p className="text-sm md:text-base text-[#7E8B9B] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 5. FINAL CTA (Screenshot 5)                        */}
      {/* ================================================== */}
      <section className="py-28 md:py-40 px-6 md:px-12 text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Your brain isn't the problem.
            <br />
            <span className="text-[#64748B]">Your method might be.</span>
          </h2>

          <p className="mt-6 text-sm md:text-base text-[#7E8B9B]">
            Discover the way you learn best.
          </p>

          <button
            onClick={handleDiscoverDNA}
            className="mt-10 inline-flex items-center gap-2.5 bg-[#00C7D4] hover:bg-[#18DCE8] text-[#050709] text-sm font-semibold px-7 py-3.5 rounded-md transition-all duration-150 active:scale-[0.98] shadow-[0_0_25px_rgba(0,199,212,0.3)]"
          >
            <span>Build my Learning DNA</span>
            <span className="text-base font-bold">→</span>
          </button>
        </div>
      </section>

      {/* Behavioral Diagnostic Modal */}
      <DiagnosticModal
        isOpen={diagnosticOpen}
        onClose={() => setDiagnosticOpen(false)}
      />
    </div>
  );
}
