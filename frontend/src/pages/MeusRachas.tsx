import React, { useEffect, useState } from 'react';
import axios from '../api/api';

interface Racha {
  id: number;
  nome: string;
  local: string;
  diaSemana: string;
  horarioInicio: string;
  duracao: string;
  vagas: number;
  privado: string;
}

const MeusRachas: React.FC = () => {
  const [rachas, setRachas] = useState<Racha[]>([]);

  useEffect(() => {
    const fetchRachas = async () => {
      try {
        const response = await axios.get('/meusrachas/participando');
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
          {rachas.map((racha) => (
            <li key={racha.id}>
              <strong>{racha.nome}</strong> - {racha.diaSemana} às {racha.horarioInicio} em {racha.local}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MeusRachas;
