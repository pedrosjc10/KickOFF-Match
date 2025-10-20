import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/authServices';
import { useUserStore } from '../stores/userStore';
import '../styles/Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUsuario } = useUserStore();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      const { usuario } = await login(email, senha);
      setUsuario({ id: usuario.id, nome: usuario.nome, email: usuario.email });


      navigate('/meusrachas');
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Email ou senha incorretos!');
    }
  };

  return (
    <div className="login-container">
      <h1>SEJA BEM VINDO!</h1>
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

        <button type="submit">
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
