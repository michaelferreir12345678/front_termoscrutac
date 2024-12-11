const generatePDF = (divergencias, arquivoRemessa, arquivoRetorno, sucesso = false) => {
    const { PDFDocument, rgb } = require('pdf-lib');

    const createTableData = (data) => {
        return data.map((row) => [
            row['CPF Remessa'],
            row['Nome Remessa'],
            row['Erro'],
        ]);
    };

    const createFileInfoSection = (arquivo, isRemessa) => {
        const nomeArquivo = arquivo.name || 'Não disponível';
        const dataCriacao = arquivo.lastModifiedDate ? new Date(arquivo.lastModifiedDate).toLocaleDateString() : 'Não disponível';
        const dataModificacao = arquivo.lastModifiedDate ? new Date(arquivo.lastModifiedDate).toLocaleDateString() : 'Não disponível';
        const tamanhoArquivo = arquivo.size ? (arquivo.size / 1024).toFixed(2) + ' KB' : 'Não disponível';

        return [
            { label: `${isRemessa ? 'Remessa' : 'Retorno'}:`, value: nomeArquivo },
            { label: 'Data de Criação:', value: dataCriacao },
            { label: 'Última Modificação:', value: dataModificacao },
            { label: 'Tamanho do Arquivo:', value: tamanhoArquivo }
        ];
    };

    const generateSuccessPDF = async () => {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 400]);

        page.drawText('Tudo certo! Nenhuma divergência encontrada.', {
            x: 50,
            y: 350,
            size: 18,
            color: rgb(0, 0, 0),
        });

        // Adicionar os detalhes dos arquivos no subtítulo
        const remessaInfo = createFileInfoSection(arquivoRemessa, true);
        const retornoInfo = createFileInfoSection(arquivoRetorno, false);

        page.drawText('Arquivo de Remessa', {
            x: 50,
            y: 300,
            size: 14,
            color: rgb(0, 0, 0),
            bold: true,
        });
        remessaInfo.forEach((info, index) => {
            page.drawText(`${info.label} ${info.value}`, {
                x: 50,
                y: 280 - (index * 20),
                size: 12,
                color: rgb(0, 0, 0),
            });
        });

        page.drawText('Arquivo de Retorno', {
            x: 300,
            y: 300,
            size: 14,
            color: rgb(0, 0, 0),
            bold: true,
        });
        retornoInfo.forEach((info, index) => {
            page.drawText(`${info.label} ${info.value}`, {
                x: 300,
                y: 280 - (index * 20),
                size: 12,
                color: rgb(0, 0, 0),
            });
        });

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    };

    const generateDivergenciaPDF = async () => {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 400]);

        page.drawText('Divergências Encontradas:', {
            x: 50,
            y: 350,
            size: 18,
            color: rgb(0, 0, 0),
        });

        const tableData = createTableData(divergencias);

        tableData.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                page.drawText(cell, {
                    x: 50 + colIndex * 150,
                    y: 320 - rowIndex * 20,
                    size: 12,
                    color: rgb(0, 0, 0),
                });
            });
        });

        const remessaInfo = createFileInfoSection(arquivoRemessa, true);
        const retornoInfo = createFileInfoSection(arquivoRetorno, false);

        page.drawText('Arquivo de Remessa', {
            x: 50,
            y: 220,
            size: 14,
            color: rgb(0, 0, 0),
            bold: true,
        });
        remessaInfo.forEach((info, index) => {
            page.drawText(`${info.label} ${info.value}`, {
                x: 50,
                y: 200 - (index * 20),
                size: 12,
                color: rgb(0, 0, 0),
            });
        });

        page.drawText('Arquivo de Retorno', {
            x: 300,
            y: 220,
            size: 14,
            color: rgb(0, 0, 0),
            bold: true,
        });
        retornoInfo.forEach((info, index) => {
            page.drawText(`${info.label} ${info.value}`, {
                x: 300,
                y: 200 - (index * 20),
                size: 12,
                color: rgb(0, 0, 0),
            });
        });

        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    };

    const generateFinalPDF = async () => {
        const pdfBytes = sucesso ? await generateSuccessPDF() : await generateDivergenciaPDF();

        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = sucesso ? 'sucesso.pdf' : 'divergencias.pdf';
        link.click();
    };

    generateFinalPDF();
};
