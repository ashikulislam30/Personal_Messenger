import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock } from 'lucide-react';
import '../styles/Auth.css';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(identifier, password);
    if (result.success) {
      navigate('/chat');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism auth-card"
      >
        <div className="auth-header">
          <LogIn size={40} className="auth-icon" />
          <h1>Welcome Back</h1>
          <p>Login to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <Mail className="input-icon" size={18} />
            <input 
              type="text" 
              placeholder="Username or Email" 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <Lock className="input-icon" size={18} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="primary-btn">
            Login
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
