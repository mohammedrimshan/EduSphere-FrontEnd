import { useAuth } from '../Context/AuthContext';
import { useTutorAuth } from '../Context/TutorAuthContext';

export const useAuthCheck = () => {
  const { user } = useAuth();
  const { tutor } = useTutorAuth();

  const isAuthenticated = Boolean(user || tutor);

  const getRedirectPath = () => {
    if (user) return '/user/home';
    if (tutor) return '/tutor/tutorhome';
    return '/';
  };

  return { isAuthenticated, getRedirectPath };
};