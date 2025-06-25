import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/authServices';
import '../styles/Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      await login(email, senha);
      navigate('/meusrachas');
    } catch (error) {
      setError('Email ou senha incorretos!');
    }
  };

  return (
    <div className="login-container">
      <h1>SEJA BEM VINDO!</h1>
      <p>BEM VINDO DE VOLTA! COLOQUE SUAS INFORMAÇÕES</p>
      {error && <p className="error">{error}</p>}
      <form className="login-form" onSubmit={handleLogin}>
        <label>Email</label>
        <input
          type="email"
          placeholder="exemplo@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Senha</label>
        <input
          type="password"
          placeholder="********"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <a href="#" className="forgot-password">
          Forgot password
        </a>

        <button type="submit" className="sign-in-btn">
          Sign in
        </button>
      </form>
      <p className="signup-text">
        Don’t have an account? <Link to="/usuarios">Sign up for free!</Link>
      </p>
    </div>
  );
};

export default Login;
