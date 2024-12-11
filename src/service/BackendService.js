import axios from "axios";
import Cookies from "js-cookie";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

axios.defaults.baseURL = `${backendUrl}`;

const getToken = () => {
    return Cookies.get("token");
};

// Adicionando interceptador de resposta para lidar com erro 401 (token expirado ou ausente)
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            alert("BACKENDSERVICE - Sessão expirada ou não autenticado. Você será redirecionado para o login.");
            window.location.href = "/#/login";
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

const BackendService = {
    processInconsistencies: async (formData) => {
        try {
            const token = getToken();
            const response = await axios.post("/processar_inconsistencia", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            return response;
        } catch (error) {
            console.error("Erro ao processar arquivos:", error);
            throw error;
        }
    },

    processErrors: async (formData) => {
        try {
            const token = getToken();
            const response = await axios.post("/processar_erros", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            return response;
        } catch (error) {
            console.error("Erro ao processar erros:", error);
            throw error;
        }
    },

    processFiles: async (formData) => {
        try {
            const token = getToken();
            const response = await axios.post("/processar_arquivo", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            return response;
        } catch (error) {
            console.error("Erro ao realizar upload:", error);
            throw error;
        }
    },

    calculateSalaryImpact: async (data) => {
        try {
            const token = getToken();
            const response = await axios.post("/employees/predict_increase", data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Resposta do backend:", response.data);
            return response.data;
        } catch (error) {
            console.error("Erro ao calcular impacto salarial:", error);
            throw error;
        }
    },

    globalSearch: async (query) => {
        try {
            const token = getToken();
            const response = await axios.get(`/search?q=${query}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response;
        } catch (error) {
            console.error("Erro ao realizar a pesquisa global:", error);
            throw error;
        }
    },

    searchUsers: async (term) => {
        try {
            const response = await axios.get(`/search/users?q=${term}`);
            return response.data;
        } catch (error) {
            console.error("Erro ao pesquisar usuários:", error);
            throw error;
        }
    },

    searchGroups: async (term) => {
        try {
            const response = await axios.get(`/search/groups?q=${term}`);
            return response.data;
        } catch (error) {
            console.error("Erro ao pesquisar grupos:", error);
            throw error;
        }
    },

    searchFunctions: async (groupId) => {
        try {
            const response = await axios.get(`/search/functions/${groupId}`);
            return response.data;
        } catch (error) {
            console.error("Erro ao pesquisar funções:", error);
            throw error;
        }
    },

    searchCompanies: async (term) => {
        try {
            const response = await axios.get(`/search/companies?q=${term}`);
            return response.data;
        } catch (error) {
            console.error("Erro ao pesquisar empresas:", error);
            throw error;
        }
    },

    processRemessa: async (formData) => {
        try {
            const token = getToken();
            
            if (!token) {
                throw new Error("Token não encontrado. Por favor, faça login novamente.");
            }
            
            const response = await axios.post("/comparar-arquivos", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            
            return response.data;
        } catch (error) {
            console.error("Erro ao processar os arquivos:", {
                message: error.message,
                response: error.response?.data,
            });
    
            throw new Error(
                error.response?.data?.message || 
                "Ocorreu um erro inesperado ao processar os arquivos. Tente novamente mais tarde."
            );
        }
    },
    
};

export default BackendService;
