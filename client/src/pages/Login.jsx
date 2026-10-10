import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Lock, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import Button from '../components/common/Button';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('sarthaktanpure256@gmail.com');
  const [password, setPassword] = useState('Sarthak@9260');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-6 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-xl shadow-indigo-600/30">
            ▲
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            AscendOS
          </h1>
          <p className="text-xs text-slate-400">
            Personal Career Operating System for Engineering Students
          </p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-2xl bg-[#111827] border border-[#233044] shadow-2xl space-y-6">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
            <div className="flex items-center gap-1.5 font-bold mb-0.5">
              <Sparkles className="w-3.5 h-3.5" /> Pre-Configured Account Ready:
            </div>
            Logged in as <strong>Sarthak Tanpure</strong> (Pravara Rural Engg College). Click below to sign in immediately.
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#162030] border border-[#28374D] text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#162030] border border-[#28374D] text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-semibold"
              isLoading={loading}
              icon={ArrowRight}
            >
              Sign In to AscendOS
            </Button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-500">
          Targeting Top Product Companies • Google, Microsoft, Amazon, Meta
        </p>
      </div>
    </div>
  );
};

export default Login;
