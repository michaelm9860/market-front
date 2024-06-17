import { createContext, useEffect, useState } from "react";
import { FC } from "../@types/FC";
import { User } from "../@types/User";

interface AuthContextType {
  isLoggedIn: boolean;
  jwt?: string | null;
  user?: User | null;
  login: (jwt: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const initialValues: AuthContextType = {
  isLoggedIn: false,
  jwt: "",
  user: null,
  login: (_) => {},
  logout: () => {},
  loading: true,
};
export const AuthContext = createContext<AuthContextType>(initialValues);


export const AuthContextProvider: FC = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [jwt, setJwt] = useState<string | null>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setJwt(token);
      setUser(JSON.parse(userData));
      setIsLoggedIn(true);
    } else {
      setJwt(null);
      setUser(null);
      setIsLoggedIn(false);
    }
    setLoading(false);
  }, []);

  const login = (jwt: string, user: User) => {
    setJwt(jwt);
    setUser(user);
    setIsLoggedIn(true);
    localStorage.setItem("token", jwt);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setJwt(null);
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const values = { jwt, user, isLoggedIn, login, logout , loading};
  return (
    <AuthContext.Provider value={values}>
      {children}
    </AuthContext.Provider>
  );
};
