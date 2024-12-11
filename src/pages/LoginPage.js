/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
// import { Dialog } from 'primereact/dialog';
import { Toast } from "primereact/toast";
import axios from "axios";
import { ProgressSpinner } from "primereact/progressspinner";
import Cookies from "js-cookie";

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [checked, setChecked] = useState(false);
    const [error, setError] = useState("");
    const [showProgressSpinner, setShowProgressSpinner] = useState(false);
    const toast = useRef(null);
    const history = useHistory();
    const API_URL = process.env.REACT_APP_BACKEND_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setShowProgressSpinner(true);

        try {
            const response = await axios.post(`${API_URL}token/`, {
                username,
                password,
            });

            const { access, refresh } = response.data;

            // Salva os tokens em cookies
            Cookies.set("accessToken", access, { expires: 1 }); // Expira em 1 dia
            Cookies.set("refreshToken", refresh, { expires: 7 }); // Expira em 7 dias

            // Redireciona para a página inicial
            history.replace("/");
        } catch (err) {
            console.error("Erro ao fazer login:", err);
            setError(err.response?.data?.detail || "Erro ao autenticar. Verifique suas credenciais.");
        } finally {
            setShowProgressSpinner(false);
        }
    };

    return (
        <div>
            <div className="flex flex-column align-items-center justify-content-center">
                <Toast ref={toast} />
                <div
                    style={{
                        marginTop: "10px",
                        borderRadius: "56px",
                        padding: "0.3rem",
                        background: "linear-gradient(180deg, #0334B0 10%, rgba(33, 150, 243, 0) 30%)",
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: "53px" }}>
                        <div className="text-center mb-5">
                            <img
                                src="assets/layout/images/logo_c2tic.svg"
                                alt="Logo"
                                style={{
                                    width: "200px",
                                    marginBottom: "10px",
                                    borderRadius: "10px",
                                }}
                            />
                            <div className="text-900 text-3xl font-medium mb-3">Seja Bem-vindo ao Portal!</div>
                            <span className="text-600 font-medium">Entrar para continuar</span>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="username" className="block text-900 text-xl font-medium mb-2">
                                    Usuário
                                </label>
                                <InputText id="username" type="text" placeholder="Insira seu Usuário" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full md:w-30rem mb-5" style={{ padding: "1rem" }} />

                                <label htmlFor="password" className="block text-900 font-medium text-xl mb-2">
                                    Senha
                                </label>
                                <Password id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" toggleMask className="w-full mb-5" inputClassName="w-full p-3 md:w-30rem" />

                                <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                    <div className="flex align-items-center">
                                        <Checkbox id="rememberme1" value={checked} onChange={(e) => setChecked(e.checked)} className="mr-2" />
                                        <label htmlFor="rememberme1">Lembrar de mim</label>
                                    </div>
                                </div>
                                {error && <div className="p-error mb-3">{error}</div>}
                                <Button
                                    type="submit"
                                    label={
                                        showProgressSpinner ? (
                                            <div style={{ display: "inline-block" }}>
                                                <span style={{ marginRight: "10px" }}>Entrando...</span>
                                                <ProgressSpinner style={{ width: "15px", height: "15px" }} fill="#0334B0" animationDuration=".5s" />
                                            </div>
                                        ) : (
                                            "Entrar"
                                        )
                                    }
                                    className="p-button-raised p-button-rounded w-full p-3 text-xl"
                                    style={{
                                        backgroundColor: "#0334B0",
                                        borderColor: "#0334B0",
                                        color: "#ffffff",
                                        marginBottom: "10px",
                                        position: "relative",
                                    }}
                                    disabled={showProgressSpinner}
                                />
                                <span>Copyright© 2024 | Todos os direitos reservados ITIC</span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
