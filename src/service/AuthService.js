import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Função para verificar se o token JWT é válido
const isTokenValid = (token) => {
    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000; 
        return decoded.exp > currentTime; 
    } catch (error) {
        console.warn('AUTHSERVICE - Token inválido ou expirado:', error);
        return false;
    }
};

// Função para registrar um novo usuário
export const register = async (user) => {
    const response = await fetch(`${API_URL}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
    });
    return response.json();
};

// Função para login e obtenção de tokens
export const login = async (credentials) => {
    const response = await fetch(`${API_URL}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    const data = await response.json();

    if (data.access && data.refresh) {
        Cookies.set('accessToken', data.access, { expires: 7 }); 
        Cookies.set('refreshToken', data.refresh, { expires: 7 }); 
    }

    return data;
};

export const refreshAccessToken = async () => {
    const refreshToken = Cookies.get('refreshToken');
    if (refreshToken && isTokenValid(refreshToken)) {
        const response = await fetch(`${API_URL}/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        });
        const data = await response.json();

        if (data.access) {
            Cookies.set('accessToken', data.access, { expires: 7 });
            return data.access;
        }
    }
    return null;
};

export const logout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
};

export const getProfile = async () => {
    let token = Cookies.get('accessToken');

    if (!isTokenValid(token)) {
        token = await refreshAccessToken();
        if (!token) {
            logout();
            throw new Error('Sessão expirada. Faça login novamente.');
        }
    }

    const response = await fetch(`${API_URL}/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        throw new Error('Erro ao obter perfil do usuário.');
    }

    return response.json();
};

export const isAuthenticated = () => {
    const accessToken = Cookies.get('accessToken');
    return accessToken && isTokenValid(accessToken);
};
