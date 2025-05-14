import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { UserData } from "./type";

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  authorized: boolean; // New property
  year: number | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  year: null,
  userData: null,
  loading: true,
  authorized: false, // Default value
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState<number | null>(null);
  // Compute the authorized state
  const authorized = !!user && !!userData; // Example: user is authorized if logged in and userData exists

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            setUserData(null);
          }
        } catch (err) {
          console.error("Failed to fetch user data from Firestore:", err);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading, authorized, year }}>
      {children}
    </AuthContext.Provider>
  );
};
