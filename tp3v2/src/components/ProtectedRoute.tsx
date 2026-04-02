import { Navigate, useLocation } from "react-router-dom";
import { UseAuth } from "../features/auth/authContext";

interface Props {
  children: React.ReactNode;
}
export default function ProtectedRoute({ children }: Props) {
  const { state } = UseAuth();
  const location = useLocation();
  if (!state.user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}
