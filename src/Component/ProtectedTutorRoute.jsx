import { Navigate, useLocation } from 'react-router-dom';
import { useTutorAuth } from '../Context/TutorAuthContext';

const ProtectedTutorRoute = ({ children }) => {
  const { tutor } = useTutorAuth();
  const location = useLocation();

  if (!tutor) {
    return <Navigate to="/tutor/tutor-login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedTutorRoute; 