import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

const API = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await fetch(`${API}/api/auth/session`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch user");
      }

      setUser(data.user || null);

    } catch (err) {
      console.error("Auth fetch error:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    fetchSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          if (!session?.access_token) {
            setUser(null);
            return;
          }

          const res = await fetch(`${API}/api/auth/session`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Failed to fetch user");
          }

          setUser(data.user || null);

        } catch (err) {
          console.error("Auth state change error:", err);
          setUser(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };

  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );

};

export const useAuth = () => useContext(AuthContext);