import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ⬅️ IMPORTANTE
import { buscarRachasQueParticipo } from '../services/partidaService';
import { useUserStore } from '../stores/userStore';
import '../styles/MeusRachas.css';

interface PartidaUsuario {
  confirmado: boolean;
  organizador: boolean;
  jog_linha: boolean;
}

interface Local {
  id: number;
  nome: string;
  logradouro?: string;
}

interface Racha {
  id: number;
  nome: string;
  data: string;
  hora: string;
  local: Local;
  partidausuarios: PartidaUsuario[];
}

const MeusRachas: React.FC = () => {
  const [rachas, setRachas] = useState<Racha[]>([]);
  const { usuario } = useUserStore();
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate(); // ⬅️ Aqui

  useEffect(() => {
    const fetchRachas = async () => {
      if (!usuario?.id) return;
      try {
        const data = await buscarRachasQueParticipo(usuario?.id);
        setRachas(data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar rachas que participa:', error);
      }
    };

    fetchRachas();
  }, [usuario]);

  return (
    <div className="meus-rachas-container">
      <h1>MEUS RACHAS</h1>
      {loading ? (
        <p className="loading">Carregando...</p>
      ) : rachas.length === 0 ? (
        <p className="empty">Você ainda não participa de nenhum racha.</p>
      ) : (
        <div className="racha-list">
          {rachas.map((racha) => (
            <div
              className="racha-card"
              key={racha.id}
              onClick={() => navigate(`/partida/${racha.id}`)} // ⬅️ AQUI muda de rota
            >
              <div className="racha-info">
                <span className="racha-nome">{racha.nome.toUpperCase()}</span>
                <span className="racha-local">{racha.local?.nome}</span>
                <span className="racha-endereco">{racha.local?.logradouro || 'Endereço não informado'}</span>
              </div>
              <div className="racha-icons">
                <span className="icon">✔️</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeusRachas;
