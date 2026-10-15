import React, { createContext, useContext, useState, useEffect } from "react";
import { api, getAuthToken, setAuthToken, getStoredUser, setStoredUser } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getAuthToken());
  const [demoUsers, setDemoUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load demo users for 1-click switcher
    api.getDemoUsers()
      .then((data) => setDemoUsers(data))
      .catch((err) => console.error("Failed to fetch demo users:", err));

    // If token exists, refresh profile
    if (token) {
      api.getMe()
        .then((userData) => {
          setUser(userData);
          setStoredUser(userData);
        })
        .catch(() => {
          // Token expired or invalid
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      // Default to citizen user if none logged in so the prototype is ready immediately
      quickSwitchRole("citizen").finally(() => setLoading(false));
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    setToken(res.access_token);
    setAuthToken(res.access_token);
    setUser(res.user);
    setStoredUser(res.user);
    return res.user;
  };

  const register = async (data) => {
    const res = await api.register(data);
    setToken(res.access_token);
    setAuthToken(res.access_token);
    setUser(res.user);
    setStoredUser(res.user);
    return res.user;
  };

  const logout = () => {
    setToken(null);
    setAuthToken(null);
    setUser(null);
    setStoredUser(null);
  };

  const quickSwitchRole = async (roleName) => {
    const credentials = {
      citizen: { email: "citizen@envi.gov", password: "citizen123" },
      mct: { email: "mct.officer@tirupati.gov", password: "mct123" },
      appcb: { email: "appcb.officer@appcb.gov", password: "appcb123" },
      forest: { email: "forest.officer@apforest.gov", password: "forest123" },
      ngo: { email: "ngo@greenaction.org", password: "ngo123" },
      admin: { email: "admin@envi.gov", password: "admin123" }
    };

    const cred = credentials[roleName] || credentials["citizen"];
    return await login(cred.email, cred.password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        role: user?.role || "guest",
        login,
        register,
        logout,
        quickSwitchRole,
        demoUsers,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
