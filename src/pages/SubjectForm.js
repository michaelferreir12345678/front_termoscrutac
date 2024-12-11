import React, { useState } from "react";
import { Button, InputText, Dropdown } from "primereact";
import { api } from "../service/api";

const SubjectForm = () => {
  const [name, setName] = useState("");
  const [classAssigned, setClassAssigned] = useState("");
  const [teacher, setTeacher] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/subjects/", { name, class_assigned: classAssigned, teacher });
      alert("Disciplina cadastrada com sucesso!");
    } catch (error) {
      alert("Erro ao cadastrar disciplina.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nome da Disciplina</label>
        <InputText value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label>Turma</label>
        <InputText value={classAssigned} onChange={(e) => setClassAssigned(e.target.value)} />
      </div>
      <div>
        <label>Professor</label>
        <Dropdown
          value={teacher}
          options={teacher.map((teacher) => ({
            label: teacher.username,
            value: teacher.id,
          }))}
          onChange={(e) => setTeacher(e.value)}
        />
      </div>
      <Button label="Cadastrar" type="submit" />
    </form>
  );
};

export default SubjectForm;
