import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../services/authServices";

const PrivateRoute: React.FC = () => {
  return getToken() ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
