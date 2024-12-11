import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { DataTable } from "primereact/datatable";
import { Calendar } from 'primereact/calendar';
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";

function UploadPage() {
  const [file, setFile] = useState(null);
  const [policyNumber, setPolicyNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [studentsData, setStudentsData] = useState([]);
  const [units, setUnits] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setBackendError("");
  };

  const handleInputChange = (setter) => (event) => {
    setter(event.target.value);
  };

  const handleUnitChange = (studentName, unit) => {
    setUnits((prev) => ({ ...prev, [studentName]: unit }));
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[studentName];
      return newErrors;
    });
  };

  const handleShowStudents = async () => {
    if (!file) {
      setBackendError("Por favor, selecione um arquivo.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await fetch("https://backendtermoscrutac.fly.dev/nomes_alunos", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const studentsData = data.students.map((name, index) => ({
          name,
          cpf: data.cpf[index],
          matricula: data.matricula[index],
          endereco: data.endereco[index],
          cidade: data.cidade[index],
          telefone: data.telefone[index],
        }));
        setStudentsData(studentsData);
        setBackendError("");
      } else {
        const errorData = await response.json();
        setBackendError(errorData.error || "Erro desconhecido ao processar a solicitação.");
      }
    } catch (error) {
      setBackendError("Erro ao se conectar ao servidor. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTerms = async () => {
    const newErrors = {};
    studentsData.forEach((student) => {
      if (!units[student.name] || units[student.name] === "Selecione...") {
        newErrors[student.name] = "Campo obrigatório";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      policyNumber,
      startDate,
      endDate,
      students: studentsData.map((student) => ({
        name: student.name,
        cpf: student.cpf,
        matricula: student.matricula,
        endereco: student.endereco,
        cidade: student.cidade,
        telefone: student.telefone,
        unit: units[student.name] || "Não Selecionado",
      })),
    };

    setLoading(true);
    try {
      const response = await fetch("https://backendtermoscrutac.fly.dev/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "termos_estagio.zip");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        setBackendError("");
      } else {
        const errorData = await response.json();
        setBackendError(errorData.error || "Erro desconhecido ao processar a solicitação.");
      }
    } catch (error) {
      setBackendError("Erro ao se conectar ao servidor. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-primary">Gerador de Termo de Compromisso de Estágio</h1>
      <p className="text-muted">
        A planilha deve conter as colunas: Nome; CPF; Matrícula; Endereço; Cidade/UF; Telefone.
      </p>

      {backendError && <div className="alert alert-danger">{backendError}</div>}

      <div className="row mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Número da Apólice"
            value={policyNumber}
            onChange={handleInputChange(setPolicyNumber)}
          />
        </div>
        <div className="col-md-4">
        <Calendar 
          value={startDate} 
          onChange={(e) => setStartDate(e.value)} 
          showIcon 
          placeholder="Data Início da Vigência"
          dateFormat="dd/mm/yy"
          className="w-100"
        />
      </div>
      <div className="col-md-4">
        <Calendar 
          value={endDate} 
          onChange={(e) => setEndDate(e.value)} 
          showIcon 
          placeholder="Data Final da Vigência"
          dateFormat="dd/mm/yy"
          className="w-100"
        />
      </div>
      </div>

      <div className="mb-3">
        <input type="file" className="form-control" onChange={handleFileChange} />
      </div>

      <button
        className="btn btn-primary mt-3"
        onClick={handleShowStudents}
        disabled={!file || loading}
      >
        {loading ? "Carregando..." : "Incluir Unidade Concedente"}
      </button>

      {studentsData.length > 0 && (
        <div className="mt-5">
          <h2>Lista de Alunos</h2>
          <p className="text-muted mb-4">Inclua as unidades concedentes dos alunos abaixo.</p>

          <DataTable value={studentsData} responsiveLayout="scroll" stripedRows>
            <Column field="name" header="Nome" sortable />
            <Column field="cpf" header="CPF" sortable />
            <Column field="matricula" header="Matrícula" />
            <Column
              header="Unidade Concedente"
              body={(rowData) => (
                <div>
                  <select
                    className={`form-select ${errors[rowData.name] ? "is-invalid" : ""}`}
                    value={units[rowData.name] || ""}
                    onChange={(e) => handleUnitChange(rowData.name, e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    <option value="Beberibe">Beberibe</option>
                    <option value="Itaitinga">Itaitinga</option>
                    <option value="Aquiraz">Aquiraz</option>
                    <option value="Aracati">Aracati</option>
                    <option value="Horizonte">Horizonte</option>
                  </select>
                  {errors[rowData.name] && <div className="invalid-feedback">{errors[rowData.name]}</div>}
                </div>
              )}
            />
          </DataTable>

          <button
            className="btn btn-success mt-4"
            onClick={handleGenerateTerms}
            disabled={loading}
          >
            {loading ? "Gerando..." : "Gerar e Baixar Termos"}
          </button>
        </div>

      )}
    </div>
  );
}

export default UploadPage;
