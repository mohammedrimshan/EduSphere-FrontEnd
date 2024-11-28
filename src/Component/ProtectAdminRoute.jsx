import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectAdminRoute = ({ children }) => {
  const adminDatas = useSelector((state) => state.admin.adminDatas);
  const location = useLocation();

  if (!adminDatas) {
    return <Navigate to="/admin/adminlogin" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectAdminRoute;
