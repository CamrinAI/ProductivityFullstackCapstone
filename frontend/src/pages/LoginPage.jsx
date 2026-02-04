import React, { useState } from 'react';
import { Package, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(username, password);
      } else {
        result = await register(username, email, password, company);
      }

      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Package className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Trade-Tracker AI
            </h1>
          </div>
          <p className="text-gray-400">Asset Management for Trade Professionals</p>
        </div>

        {/* Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {isLogin ? 'Login' : 'Create Account'}
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded text-red-300 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
            <legend className="fieldset-legend">{isLogin ? 'Login' : 'Sign Up'}</legend>

            <label className="label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              disabled={loading}
              className="input"
            />

            {!isLogin && (
              <>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  disabled={loading}
                  className="input"
                />

                <label className="label">Company (Optional)</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company name"
                  disabled={loading}
                  className="input"
                />
              </>
            )}

            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={loading}
              className="input"
            />

            <button
              type="submit"
              disabled={loading}
              className="btn btn-neutral mt-4 w-full"
            >
              {loading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
            </button>
          </fieldset>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center text-sm text-gray-400">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              disabled={loading}
              className="text-blue-400 hover:text-blue-300 font-semibold disabled:opacity-50"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Demo: username: demo | password: demo123</p>
        </div>
      </div>
    </div>
  );
}
