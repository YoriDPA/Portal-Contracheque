// api/employees.js - API para gerir funcionários (VERSÃO DE DIAGNÓSTICO)

const { google } = require('googleapis');

// Função de autenticação reutilizável
async function getAuthClient() {
    console.log("API-EMPLOYEES: A tentar obter o cliente de autenticação...");
    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const client = await auth.getClient();
    console.log("API-EMPLOYEES: Cliente de autenticação obtido com sucesso.");
    return client;
}

// Função principal que o Vercel irá executar
module.exports = async (req, res) => {
    console.log(`--- Início do Pedido para /api/employees | Método: ${req.method} ---`);
    
    // Configurações de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Segurança básica
    console.log("API-EMPLOYEES: A verificar a autorização...");
    if (req.headers.authorization !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
        console.error("API-EMPLOYEES: FALHA na autorização.");
        return res.status(401).json({ success: false, message: 'Acesso não autorizado.' });
    }
    console.log("API-EMPLOYEES: Autorização verificada com sucesso.");

    try {
        const authClient = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        // GET: Retorna a lista de funcionários
        if (req.method === 'GET') {
            console.log("API-EMPLOYEES (GET): A tentar ler a planilha com ID:", spreadsheetId);
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: 'A:C',
            });
            console.log("API-EMPLOYEES (GET): Resposta da API do Google Sheets recebida.");
            const rows = response.data.values || [];
            if (rows.length > 1) {
                const employees = rows.slice(1).map((row, index) => ({
                    cpf: row[0],
                    matricula: row[1],
                    nome: row[2],
                    rowIndex: index + 2
                }));
                console.log(`API-EMPLOYEES (GET): ${employees.length} funcionários encontrados.`);
                return res.status(200).json({ success: true, employees });
            }
            console.log("API-EMPLOYEES (GET): Nenhum funcionário encontrado na planilha.");
            return res.status(200).json({ success: true, employees: [] });
        }

        // ... (o resto dos métodos POST, PUT, DELETE permanecem iguais)
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
                                sheetId: 0,
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
        console.error('ERRO CRÍTICO NA API DE FUNCIONÁRIOS:', error);
        return res.status(500).json({ success: false, message: `Erro no servidor: ${error.message}` });
    }
};
