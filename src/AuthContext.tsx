import { createContext, useContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  recoveryMode: boolean;
  profileOpen: boolean;
  setProfileOpen: (open: boolean) => void;
  resetPasswordOpen: boolean;
  setResetPasswordOpen: (open: boolean) => void;
}

export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  recoveryMode: false,
  profileOpen: false,
  setProfileOpen: () => {},
  resetPasswordOpen: false,
  setResetPasswordOpen: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};
