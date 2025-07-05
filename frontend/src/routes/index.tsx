import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Cadastro from '../pages/Cadastro';
import CriarRacha from '../pages/CriarRachas';
import MeusRachas from '../pages/MeusRachas';
import AuthLoader from '../pages/AuthLoader';
import ProtectedRoute from '../pages/ProtectedRoute';
import PartidaDetalhes from '../pages/PartidaDetalhes';

const AppRoutes = () => {
  return (
    <ProtectedRoute>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthLoader />} />
          <Route path="/partida/:id" element={<PartidaDetalhes />} />
          <Route path="/login" element={<Login />}  />
          <Route path="/usuarios" element={<Cadastro />} />
          <Route path="/criarrachas" element={<CriarRacha />} />
          <Route path="/meusrachas" element={<MeusRachas />} />
        </Routes>
      </BrowserRouter>
    </ProtectedRoute>
  );
};

export default AppRoutes;
