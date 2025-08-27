import React, { useState, useEffect } from 'react';
import '../styles/CreateTipoPartida.module.css';
import { createTipoPartida, getTiposPartida, TipoPartida } from '../services/tipoPartidaService';

const CreateTipoPartida: React.FC = () => {
  const [form, setForm] = useState({
    nomeTipoPartida: '',
    quantidadeJogadores: ''
  });

  const [tiposPartida, setTiposPartida] = useState<TipoPartida[]>([]);
  const [selectedTipo, setSelectedTipo] = useState<number>(0);
  const [message, setMessage] = useState('');

  // Pega os tipos de partida do backend
  useEffect(() => {
    const fetchTipos = async () => {
      const dados = await getTiposPartida();
      setTiposPartida(dados);
    };
    fetchTipos();
  }, []);

  const isFormValid =
    form.nomeTipoPartida.trim().length > 0 &&
    form.quantidadeJogadores.trim().length > 0 &&
    !isNaN(Number(form.quantidadeJogadores)) &&
    Number(form.quantidadeJogadores) > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      setMessage('Preencha todos os campos corretamente.');
      return;
    }

    try {
      await createTipoPartida({
        nomeTipoPartida: form.nomeTipoPartida.trim(),
        quantidadeJogadores: Number(form.quantidadeJogadores)
      });

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
          <label className="criartipopartida-label" htmlFor="nomeTipoPartida">
            Nome do Tipo
          </label>
          <input
            className="criartipopartida-input"
            name="nomeTipoPartida"
            placeholder="Nome do Tipo"
            value={form.nomeTipoPartida}
            onChange={handleChange}
            required
          />

          <label className="criartipopartida-label" htmlFor="quantidadeJogadores">
            Quantidade de Jogadores
          </label>
          <input
            className="criartipopartida-input"
            name="quantidadeJogadores"
            type="number"
            placeholder="Quantidade de Jogadores"
            value={form.quantidadeJogadores}
            onChange={handleChange}
            required
          />

          <button
            className="criartipopartida-button"
            type="submit"
            disabled={!isFormValid}
          >
            Cadastrar
          </button>
        </form>

        {message && <p className="criartipopartida-message">{message}</p>}
      </div>
    </div>
  );
};

export default CreateTipoPartida;
