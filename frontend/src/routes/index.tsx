import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Cadastro from '../pages/Cadastro';
import CriarRacha from '../pages/CriarRachas';
import MeusRachas from '../pages/MeusRachas';
import AuthLoader from '../pages/AuthLoader';
import ProtectedRoute from '../pages/ProtectedRoute';
import PartidaDetalhes from '../pages/PartidaDetalhes';
import PartidasPublicas from '../pages/PartidasPublicas';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthLoader />} />
        <Route path="/login" element={<Login />} />
        <Route path="/usuarios" element={<Cadastro />} />

        {/* rotas protegidas */}
        <Route
          path="/criarrachas"
          element={
            <ProtectedRoute>
              <CriarRacha />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meusrachas"
          element={
            <ProtectedRoute>
              <MeusRachas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partida/:id"
          element={
            <ProtectedRoute>
              <PartidaDetalhes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/partida/:id"
          element={
            <ProtectedRoute>
              <PartidasPublicas />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
