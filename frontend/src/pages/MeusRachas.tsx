import React, { useEffect, useState } from 'react';
import axios from '../api/api';

interface PartidaUsuario {
  confirmado: boolean;
  organizador: boolean;
  jog_linha: boolean;
}

interface Local {
  id: number;
  nome: string;
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

  useEffect(() => {
    const fetchRachas = async () => {
      try {
        const response = await axios.get('/meusrachas/participando/${}');
        setRachas(response.data);
      } catch (error) {
        console.error('Erro ao buscar rachas que participa:', error);
      }
    };

    fetchRachas();
  }, []);

  return (
    <div className="rachas-container">
      <h1>Rachas que participo</h1>
      {rachas.length === 0 ? (
        <p>Você ainda não participa de nenhum racha.</p>
      ) : (
        <ul>
          {rachas.map((racha) => {
            const info = racha.partidausuarios[0]; // deve ser sempre 1 pra esse usuário
            return (
              <li key={racha.id}>
                <strong>{racha.nome}</strong> - {racha.data} às {racha.hora} em {racha.local?.nome || 'Local não informado'}
                <ul>
                  <li>Confirmado: {info?.confirmado ? 'Sim' : 'Não'}</li>
                  <li>Organizador: {info?.organizador ? 'Sim' : 'Não'}</li>
                  <li>Jogador de linha: {info?.jog_linha ? 'Sim' : 'Não'}</li>
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MeusRachas;
