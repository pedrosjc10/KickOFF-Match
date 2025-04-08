import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Cadastro from '../pages/Cadastro';
import MeusRachas from '../pages/MeusRachas';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/usuarios" element={<Cadastro />} />
        <Route path="/meusrachas" element={<MeusRachas />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
