import React, { useState, useEffect } from "react";
import { api } from "../service/api";

const ProfilePage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/users/profile");
        setUser(response.data);
      } catch (error) {
        alert("Erro ao carregar dados.");
      }
    };
    fetchUserData();
  }, []);

  if (!user) return <div>Carregando...</div>;

  return (
    <div>
      <h2>Perfil do Aluno</h2>
      <p>Nome: {user.username}</p>
      <p>Email: {user.email}</p>
      <p>Tipo de Usuário: {user.user_type}</p>
    </div>
  );
};

export default ProfilePage;
