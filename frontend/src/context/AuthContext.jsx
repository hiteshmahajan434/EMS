import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({children}){
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    const refreshSession = async () => {
        const storedToken = localStorage.getItem("token");
        if(!storedToken){
            setUser(null);
            setToken(null);
            setLoading(false);
            return;
        }
        try {
            const {data} = await api.get("/auth/session");
            setUser(data.user);
        } catch (error) {
            //Token is invalid, clear it
            localStorage.removeItem("token");
            setUser(null);
            setToken(null);
        }
        finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        refreshSession();
    }, []);

    const login = async (email, password, portalRole) => {
        const { data } = await api.post("/auth/login", {
            email,
            password,
            portalRole
        });

        updateToken(data.token);

        await refreshSession();

        return data;
    };

    const logout = async () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    }

    const updateToken = (nextToken) => {
        localStorage.setItem("token", nextToken);
        setToken(nextToken);
    };

    const value = {user, token, loading, login, logout, refreshSession, updateToken};

    return <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
}

export function useAuth(){
    const ctx = useContext(AuthContext);
    if(!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}