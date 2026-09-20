import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import SectionLabel from '../components/SectionLabel';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Where to redirect after successful login
  const from = location.state?.from?.pathname || '/learn';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error', err);
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050709] text-[#F3F4F6] py-16 px-6 flex flex-col items-center justify-center selection:bg-[#00C7D4]/30 selection:text-white">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 mb-8 group">
          <div className="w-6 h-6 text-[#00C7D4] transition-transform duration-300 group-hover:scale-110">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.4" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-full h-full"
            >
              <path d="M2 15c6.667-6 13.333 0 20-6" />
              <path d="M9 22c1.8-2 2.5-4 2.8-6" />
              <path d="M15 2c-1.8 2-2.5 4-2.8 6" />
              <path d="M17 6l-2.5-2.5" />
              <path d="M14 8l-1-1" />
              <path d="M7 18l2.5 2.5" />
            </svg>
          </div>
          <span className="font-bold tracking-[0.15em] text-base text-white uppercase font-sans">
            ADAPT
          </span>
        </Link>

        {/* Card Container */}
        <div className="w-full bg-[#090D12] border border-[#141C24] rounded-xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
          <SectionLabel>AUTHENTICATION</SectionLabel>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Welcome back.
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-[#7E8B9B]">
            Continue where your learning journey left off.
          </p>

          {error && (
            <div className="mt-6 p-3.5 bg-amber-950/20 border border-amber-900/40 rounded-md flex items-center gap-2.5 text-xs text-amber-300 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono uppercase text-[#7E8B9B]">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                autoComplete="email"
                className="w-full bg-[#050709] border border-[#141C24] focus:border-[#00C7D4] focus:outline-none rounded-md px-4 py-2.5 text-sm text-white placeholder-[#475569] font-sans transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase text-[#7E8B9B]">
                  Password
                </label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-[#050709] border border-[#141C24] focus:border-[#00C7D4] focus:outline-none rounded-md px-4 py-2.5 text-sm text-white placeholder-[#475569] font-sans transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim() || !password}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-[#00C7D4] hover:bg-[#18DCE8] disabled:opacity-40 text-[#050709] text-xs font-semibold py-3 rounded-md transition-all duration-150 active:scale-[0.98] shadow-[0_0_15px_rgba(0,199,212,0.2)]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Log in</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer link to Signup */}
          <div className="mt-8 pt-6 border-t border-[#141C24] text-center text-xs text-[#7E8B9B]">
            Don't have an account?{' '}
            <Link
              to="/signup"
              state={{ from: location.state?.from }}
              className="text-[#00C7D4] hover:underline font-medium"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
