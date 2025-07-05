const { google } = require('googleapis');

// Função de autenticação reutilizável
async function getAuthClient() {
    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return await auth.getClient();
}

// Função principal que o Vercel irá executar
module.exports = async (req, res) => {
    // Configurações de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Segurança básica
    if (req.headers.authorization !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
        return res.status(401).json({ success: false, message: 'Acesso não autorizado.' });
    }

    try {
        const authClient = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        // --- LÓGICA PARA DIFERENTES MÉTODOS HTTP ---

        // GET: Retorna a lista de funcionários
        if (req.method === 'GET') {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: 'A:C',
            });
            const rows = response.data.values || [];
            if (rows.length > 1) {
                const employees = rows.slice(1).map((row, index) => ({
                    cpf: row[0],
                    matricula: row[1],
                    nome: row[2],
                    rowIndex: index + 2 // Guardar o número da linha real na planilha
                }));
                return res.status(200).json({ success: true, employees });
            }
            return res.status(200).json({ success: true, employees: [] });
        }

        // POST: Adiciona um novo funcionário
        if (req.method === 'POST') {
            const { nome, cpf, matricula } = req.body;
            if (!nome || !cpf || !matricula) {
                return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
            }
            await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: 'A1',
                valueInputOption: 'USER_ENTERED',
                resource: { values: [[cpf, matricula, nome]] },
            });
            return res.status(201).json({ success: true, message: 'Funcionário adicionado com sucesso!' });
        }

        // PUT: Atualiza um funcionário existente
        if (req.method === 'PUT') {
            const { nome, matricula, rowIndex } = req.body;
            if (!nome || !matricula || !rowIndex) {
                return res.status(400).json({ success: false, message: 'Faltam dados para a atualização.' });
            }
            // Nota: O CPF não é editável, pois é o nosso identificador.
            // Atualiza apenas o nome (coluna C) e a matrícula (coluna B)
            await sheets.spreadsheets.values.batchUpdate({
                spreadsheetId,
                resource: {
                    data: [
                        { range: `B${rowIndex}`, values: [[matricula]] },
                        { range: `C${rowIndex}`, values: [[nome]] }
                    ],
                    valueInputOption: 'USER_ENTERED',
                },
            });
            return res.status(200).json({ success: true, message: 'Funcionário atualizado com sucesso!' });
        }

        // DELETE: Apaga um funcionário
        if (req.method === 'DELETE') {
            const { rowIndex } = req.body;
            if (!rowIndex) {
                return res.status(400).json({ success: false, message: 'Falta o identificador da linha para apagar.' });
            }
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                resource: {
                    requests: [{
                        deleteDimension: {
                            range: {
                                sheetId: 0, // ID da primeira página da planilha
                                dimension: 'ROWS',
                                startIndex: rowIndex - 1,
                                endIndex: rowIndex
                            }
                        }
                    }]
                }
            });
            return res.status(200).json({ success: true, message: 'Funcionário apagado com sucesso!' });
        }

        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Método ${req.method} não permitido.`);

    } catch (error) {
        console.error('ERRO NA API DE FUNCIONÁRIOS:', error);
        return res.status(500).json({ success: false, message: `Erro no servidor: ${error.message}` });
    }
};
