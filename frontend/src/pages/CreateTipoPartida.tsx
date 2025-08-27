import React, { useState } from 'react';
import '../styles/CreateTipoPartida.module.css';

const CreateTipoPartida: React.FC = () => {
  const [form, setForm] = useState({
    nomeTipoPartida: '',
    quantidadeJogadores: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Usando o service
      await import('../services/tipoPartidaService').then(({ createTipoPartida }) =>
        createTipoPartida()
      );
      setMessage('Tipo de partida cadastrado com sucesso!');
      setForm({ nomeTipoPartida: '', quantidadeJogadores: '' });
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Erro ao cadastrar tipo de partida');
    }
  };

  return (
    <div className="criartipopartida-container">
      <div className="criartipopartida-card">
        <h2 className="criartipopartida-title">Cadastrar Tipo de Partida</h2>
        <form className="criartipopartida-form" onSubmit={handleSubmit}>
          <label className="criartipopartida-label" htmlFor="nomeTipoPartida">Nome do Tipo</label>
          <input className="criartipopartida-input" name="nomeTipoPartida" placeholder="Nome do Tipo" value={form.nomeTipoPartida} onChange={handleChange} required />
          <label className="criartipopartida-label" htmlFor="quantidadeJogadores">Quantidade de Jogadores</label>
          <input className="criartipopartida-input" name="quantidadeJogadores" type="number" placeholder="Quantidade de Jogadores" value={form.quantidadeJogadores} onChange={handleChange} required />
          <button className="criartipopartida-button" type="submit">Cadastrar</button>
        </form>
        {message && <p className="criartipopartida-message">{message}</p>}
      </div>
    </div>
  );
};

export default CreateTipoPartida;
