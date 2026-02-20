import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { UserPlus, User, Mail, Lock, AtSign } from 'lucide-react';
import '../styles/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(formData);
    if (result.success) {
      navigate('/chat');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="auth-container">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-morphism auth-card"
      >
        <div className="auth-header">
          <UserPlus size={40} className="auth-icon" />
          <h1>Join Us</h1>
          <p>Create your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="input-group">
              <User className="input-icon" size={18} />
              <input 
                name="firstName"
                placeholder="First Name" 
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <User className="input-icon" size={18} />
              <input 
                name="lastName"
                placeholder="Last Name" 
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="input-group">
            <AtSign className="input-icon" size={18} />
            <input 
              name="username"
              placeholder="Username" 
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <Mail className="input-icon" size={18} />
            <input 
              name="email"
              type="email"
              placeholder="Email Address" 
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="input-group">
            <Lock className="input-icon" size={18} />
            <input 
              name="password"
              type="password" 
              placeholder="Password" 
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="primary-btn">
            Create Account
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
