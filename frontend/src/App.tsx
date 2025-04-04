import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import MeusRachas from "./pages/MeusRachas";
import PrivateRoute from "./routes/PrivateRoute";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute />}>
          <Route path="/meusrachas" element={<MeusRachas />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;