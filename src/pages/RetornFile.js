import React, { useState, useRef } from "react";
import { FileUpload } from "primereact/fileupload";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ToggleButton } from "primereact/togglebutton";
import { Message } from "primereact/message";
import { ProgressBar } from "primereact/progressbar";
import BackendService from "../service/BackendService";
import jsPDF from "jspdf";
import "jspdf-autotable";

const RetornFile = () => {
    const [results, setResults] = useState([]);
    const [erros, setErros] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingErros, setLoadingErros] = useState(false);
    const [idFrozen, setIdFrozen] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showWarningMessageErro, setShowWarningMessageErro] = useState(false);
    const [showSuccessMessageErro, setShowSuccessMessageErro] = useState(false);
    const [showWarningMessage, setShowWarningMessage] = useState(false);
    const [showProgressBar, setShowProgressBar] = useState(false);
    const fileUploadRef = useRef(null);

    const onUpload = async (e) => {
        const files = e.files;
        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            formData.append("arquivos", files[i]);
        }

        try {
            setShowProgressBar(true);

            setLoading(true);

            const responseErros = await BackendService.processErrors(formData);
            setLoadingErros(true);

            const responseArquivos = await BackendService.processInconsistencies(formData);
            setLoadingErros(false);

            setResults(responseArquivos.data.nomes_inconsistentes);
            setErros(responseErros.data.erros);

            if (responseArquivos.data.nomes_inconsistentes.length === 0) {
                setShowSuccessMessage(true);
                setShowWarningMessage(false);
            } else {
                setShowSuccessMessage(false);
                setShowWarningMessage(true);
            }

            if (responseErros.data.erros.length === 0) {
                setShowSuccessMessageErro(true);
                setShowWarningMessageErro(false);
            } else {
                setShowSuccessMessageErro(false);
                setShowWarningMessageErro(true);
            }
        } catch (error) {
            console.error("Erro ao enviar arquivos:", error);
            setResults([{ error: "Erro ao enviar arquivos" }]);
            setErros([{ error: "Erro ao enviar arquivos" }]);
        } finally {
            setLoading(false);
            setLoadingErros(false);
            setShowProgressBar(false);
        }
    };

    const handleCancel = () => {
        window.location.reload();
    };

    const itemTemplate = (file, props) => {
        const index = props.index;
        const totalFiles = props.files.length;

        if (index < 5) {
            return (
                <React.Fragment key={file.name}>
                    <span>{file.name}</span>
                    {index < 4 && <span>, </span>}
                </React.Fragment>
            );
        } else if (index === 5) {
            return (
                <div key={`more-files-${totalFiles}`} className="p-fileupload-file">
                    <div>...e mais {totalFiles - 5} arquivo(s)</div>
                </div>
            );
        }
        return null;
    };

    const formatCurrency = (value) => {
        const numericValue = parseInt(value, 10);
        const decimalValue = numericValue / 100;
        return decimalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    };

    const generatePDF = () => {
      const doc = new jsPDF();
  
      const headerImagePath = "/cabecalho.png"; // Caminho do cabeçalho na pasta public
      const headerImgWidth = 175; // Largura proporcional da imagem
      const headerImgHeight = (414 / 1757) * headerImgWidth; // Altura proporcional
      const pageWidth = doc.internal.pageSize.width;
      const margin = 10; // Margem para o cabeçalho
  
      const logoPath = "/logo_prefeitura.png";
      const imgWidth = 150;
      const imgHeight = 150;
      const pageHeight = doc.internal.pageSize.height;
  
      const headerImg = new Image();
      const logoImg = new Image();
      headerImg.src = headerImagePath;
      logoImg.src = logoPath;
  
      headerImg.onload = () => {
          logoImg.onload = () => {
              // Define o evento para desenhar o cabeçalho em cada página
              const addHeader = () => {
                  doc.addImage(headerImg, "PNG", margin, 5, headerImgWidth, headerImgHeight);
              };
  
              // Adiciona o cabeçalho na primeira página
              addHeader();
  
              // Adiciona a marca d'água
              doc.setGState(new doc.GState({ opacity: 0.1 }));
              doc.addImage(logoImg, "PNG", (pageWidth - imgWidth) / 2, (pageHeight - imgHeight) / 2, imgWidth, imgHeight);
              doc.setGState(new doc.GState({ opacity: 1 }));
  
              // Texto principal
              doc.setFontSize(18);
              doc.text("Relatório de Inconsistências e Erros", 14, headerImgHeight + 14);
  
              const headStyles = {
                  fillColor: [255, 193, 7],
                  textColor: [255, 255, 255],
              };
  
              let startY = headerImgHeight + 22;
  
              // Se existirem erros
              if (erros.length > 0) {
                  doc.setFontSize(14);
                  doc.text("Resultado da Vala", 14, startY);
                  startY += 4;
                  doc.autoTable({
                      startY,
                      headStyles,
                      head: [["Nome do Favorecido", "CPF", "Agencia", "Número da Conta", "Matrícula Funcionário", "Valor do Pagamento", "Descrição da Ocorrência"]],
                      body: erros.map((erro) => [
                          erro["Nome do Favorecido_arquivo"],
                          erro["CPF_arquivo"],
                          erro["Agencia_arquivo"],
                          erro["Numero da Conta Corrente_arquivo"],
                          erro["Matricula funcionario_arquivo"],
                          erro["Valor do Pagamento"],
                          erro["Descrição da Ocorrência"],
                      ]),
                  });
                  startY = doc.previousAutoTable.finalY + 10;
              }
  
              // Se existirem inconsistências
              if (results.length > 0) {
                  doc.setFontSize(14);
                  doc.text("Resultado das inconsistências de CPF", 14, startY);
                  startY += 4;
                  doc.autoTable({
                      startY,
                      headStyles,
                      head: [["Nome do Favorecido", "CPF", "Agencia", "Número da Conta", "Matrícula Funcionário", "Empresa", "Valor do Pagamento"]],
                      body: results.map((result) => [
                          result["Nome do Favorecido"],
                          result["CPF"],
                          result["Ag. Mantenedora da Cta do Favor."],
                          result["Numero da Conta Corrente"],
                          result["Matricula funcionario"],
                          result["Empresa"],
                          formatCurrency(result["Valor do Pagamento"]),
                      ]),
                  });
                  startY = doc.previousAutoTable.finalY + 10;
              }
  
              // Adiciona rodapé
              const date = new Date();
              const formattedDate = `${date.toLocaleDateString()} às ${date.toLocaleTimeString()}`;
              doc.setTextColor(0, 0, 0);
              doc.setFont("helvetica", "normal");
              doc.text(`Este relatório foi emitido em ${formattedDate}.`, 10, doc.internal.pageSize.height - 10);
  
              // Adiciona cabeçalho em novas páginas
              const pageCount = doc.internal.getNumberOfPages();
              for (let i = 1; i <= pageCount; i++) {
                  doc.setPage(i);
                  addHeader();
              }
  
              // Salva o PDF
              doc.save("relatorio.pdf");
          };
      };
  };
  

    return (
        <div>
            <h2>Insira abaixo os arquivos retorno</h2>
            <h6>Verificação dos funcionários que foram para a vala e verificação de inconsistência de CPFs entre o arquivo bancário e a base de dados do ConsistRH</h6>
            <FileUpload
                ref={fileUploadRef}
                className="custom-file-upload"
                name="arquivos"
                customUpload
                uploadHandler={onUpload}
                onClear={handleCancel}
                accept=".txt, .ret, .rem"
                maxFileSize={10000000}
                multiple
                chooseLabel="Escolha os arquivos"
                itemTemplate={itemTemplate}
                uploadLabel="Enviar"
                emptyTemplate={<p className="p-m-0">Arraste e solte arquivos aqui para fazer o upload.</p>}
            />
            <div className="grid mt-1 flex justify-content-center">
                {erros.length > 0 && (
                    <div className="col-12 lg:col-6 xl:col-3">
                        <div className="card mb-0 fadein animation-duration-500" style={{ color: "#ffc107", borderLeft: "4px solid" }}>
                            <div className="flex justify-content-between mb-3">
                                <div>
                                    <span className="block text-500 font-medium mb-3">Total da vala</span>
                                    <div className="text-900 font-medium text-xl">{erros.length}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {results.length > 0 && (
                    <div className="col-12 lg:col-6 xl:col-3">
                        <div className="card mb-0 fadein animation-duration-500" style={{ color: "#ffc107", borderLeft: "4px solid" }}>
                            <div className="flex justify-content-between mb-3">
                                <div>
                                    <span className="block text-500 font-medium mb-3">Total Inconsistências</span>
                                    <div className="text-900 font-medium text-xl">{results.length}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {showSuccessMessageErro && <Message className="fadein animation-duration-500" severity="success" text="Parabéns!! Não houve nenhum funcionário que caiu na vala. Não houve nenhum erro." />}

            {showWarningMessageErro && <Message className="fadein animation-duration-500" severity="warn" text={`Houveram ${erros.length} funcionários que cairam na vala.`} />}

            {showProgressBar && <ProgressBar mode="indeterminate" style={{ height: "6px" }} className="custom-progress-bar" />}

            {erros.length > 0 && (
                <div className="card">
                    <h5>Resultados dos Erros do arquivo bancário</h5>
                    <h6>O quadro abaixo reflete os resultados da vala. Somente pessoas com resultado diferente de BD</h6>
                    <DataTable value={erros} scrollable scrollHeight="400px" loading={loadingErros} scrollDirection="both" className="mt-3">
                        <Column field="Nome do Favorecido_arquivo" header="Nome do Favorecido" style={{ flexGrow: 1, flexBasis: "300px" }} frozen></Column>
                        <Column field="CPF_arquivo" header="CPF" style={{ flexGrow: 1, flexBasis: "100px" }} alignFrozen="left"></Column>
                        <Column field="Agencia_arquivo" header="Agência" style={{ flexGrow: 1, flexBasis: "100px" }}></Column>
                        <Column field="Numero da Conta Corrente_arquivo" header="Número da Conta" style={{ flexGrow: 1, flexBasis: "150px" }}></Column>
                        <Column field="Matricula funcionario_arquivo" header="Matrícula Funcionário" style={{ flexGrow: 1, flexBasis: "150px" }}></Column>
                        <Column field="Valor do Pagamento" header="Valor do Pagamento" style={{ flexGrow: 1, flexBasis: "150px" }}></Column>
                        <Column field="Arquivo" header="Arquivo" style={{ flexGrow: 1, flexBasis: "100px" }}></Column>
                        <Column field="Descrição da Ocorrência" header="Descrição da Ocorrência" style={{ flexGrow: 1, flexBasis: "300px" }} frozen></Column>
                    </DataTable>
                </div>
            )}

            {showSuccessMessage && <Message className="fadein animation-duration-500" severity="success" text="Não houve nenhuma inconsistência." />}

            {showWarningMessage && <Message className="fadein animation-duration-500" severity="warn" text={`Houveram ${results.length} inconsistências.`} />}

            {results.length > 0 && (
                <div className="card">
                    <h5>Resultados das inconsistências entre CPFs</h5>
                    <h6>O quadro abaixo reflete as inconsistências de CPFs entre o arquivo bancário e a base de dados do ConsistRH</h6>
                    <ToggleButton checked={idFrozen} onChange={(e) => setIdFrozen(e.value)} onIcon="pi pi-lock" offIcon="pi pi-lock-open" onLabel="Unfreeze Id" offLabel="Freeze Id" style={{ width: "10rem" }} />

                    <DataTable value={results} scrollable scrollHeight="400px" loading={loading} scrollDirection="both" className="mt-3">
                        <Column field="Nome do Favorecido" header="Nome do Favorecido" style={{ flexGrow: 1, flexBasis: "300px" }} frozen></Column>
                        <Column field="CPF" header="CPF" style={{ flexGrow: 1, flexBasis: "100px" }} frozen={idFrozen} alignFrozen="left"></Column>
                        <Column field="Ag. Mantenedora da Cta do Favor." header="Agência" style={{ flexGrow: 1, flexBasis: "100px" }}></Column>
                        <Column field="Numero da Conta Corrente" header="Número da Conta" style={{ flexGrow: 1, flexBasis: "150px" }}></Column>
                        <Column field="Matricula funcionario" header="Matrícula Funcionário" style={{ flexGrow: 1, flexBasis: "150px" }}></Column>
                        <Column field="Empresa" header="Empresa" style={{ flexGrow: 1, flexBasis: "100px" }}></Column>
                        <Column field="Valor do Pagamento" header="Valor" style={{ flexGrow: 1, flexBasis: "150px" }} body={(data) => formatCurrency(parseFloat(data["Valor do Pagamento"]))}></Column>
                        <Column field="nome_arquivo" header="Arquivo" style={{ flexGrow: 1, flexBasis: "150px" }}></Column>
                    </DataTable>
                </div>
            )}
            {(results.length > 0 || erros.length > 0) && (
                <div className="p-mt-4 mb-4">
                    <button className="p-button p-component p-button-success p-button-icon-left" onClick={generatePDF}>
                        <span className="p-button-icon pi pi-file-pdf"></span>
                        Gerar Relatório em PDF
                    </button>
                </div>
            )}
        </div>
    );
};

export default RetornFile;
