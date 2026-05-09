'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <span className="logo">🛰️</span>
          <h1 className="title">STATION COMMAND</h1>
          <p className="subtitle">ORBITAL OPERATIONS CENTER</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">COMMANDER ID</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">ACCESS CODE</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="enter your password"
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'AUTHENTICATING...' : 'ENTER STATION'}
          </button>
        </form>

        <div className="login-footer">
          <p>Don&apos;t have access? <a href="/register">Request Clearance</a></p>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a12;
          background-image: 
            radial-gradient(ellipse at top, #1a1a2e 0%, transparent 50%),
            radial-gradient(ellipse at bottom, #0f0f1a 0%, transparent 50%);
        }

        .login-container {
          width: 100%;
          max-width: 400px;
          padding: 2rem;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logo {
          font-size: 4rem;
          display: block;
          margin-bottom: 1rem;
          animation: pulse 2s infinite;
        }

        .title {
          font-family: 'Courier New', monospace;
          font-size: 1.5rem;
          color: #7fdbca;
          letter-spacing: 0.3em;
          margin: 0;
        }

        .subtitle {
          font-family: 'Courier New', monospace;
          font-size: 0.7rem;
          color: #636e72;
          letter-spacing: 0.2em;
          margin: 0.5rem 0 0;
        }

        .login-form {
          background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
          border: 2px solid #3d3d5c;
          padding: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-family: 'Courier New', monospace;
          font-size: 0.7rem;
          color: #f39c12;
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          background: #0a0a12;
          border: 2px solid #3d3d5c;
          color: #ecf0f1;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          box-sizing: border-box;
        }

        .form-group input:focus {
          outline: none;
          border-color: #7fdbca;
        }

        .form-group input::placeholder {
          color: #4a4a5c;
        }

        .form-group input:disabled {
          opacity: 0.5;
        }

        .error-message {
          background: rgba(231, 76, 60, 0.2);
          border: 1px solid #e74c3c;
          color: #e74c3c;
          padding: 0.75rem;
          font-family: 'Courier New', monospace;
          font-size: 0.75rem;
          margin-bottom: 1rem;
          text-align: center;
        }

        .login-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(180deg, #7fdbca 0%, #5bc0be 100%);
          border: none;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          font-weight: bold;
          color: #0a0a12;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.2s;
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(127, 219, 202, 0.4);
        }

        .login-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .login-footer {
          text-align: center;
          margin-top: 1.5rem;
          font-family: 'Courier New', monospace;
          font-size: 0.75rem;
          color: #636e72;
        }

        .login-footer a {
          color: #7fdbca;
          text-decoration: none;
        }

        .login-footer a:hover {
          text-decoration: underline;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
