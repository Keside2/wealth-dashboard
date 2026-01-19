import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth'; // added updateProfile here too
import { auth } from '../lib/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 This function will help us update the name and show it immediately
  const updateUserProfile = async (name) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: name });
      // This forces the local state to update so the sidebar changes
      setUser({ ...auth.currentUser, displayName: name });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, logout, updateUserProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);