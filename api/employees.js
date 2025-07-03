// api/employees.js - A nossa nova API para gerir funcionários

const { google } = require('googleapis');

// Função de autenticação reutilizável
async function getAuthClient() {
    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
        scopes: [
            'https://www.googleapis.com/auth/drive', // Permissão total para o Drive
            'https://www.googleapis.com/auth/spreadsheets' // Permissão total para as Planilhas
        ],
    });
    return await auth.getClient();
}

// Função principal que o Vercel irá executar
module.exports = async (req, res) => {
    // Configurações de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Segurança básica: verifica uma senha enviada no cabeçalho
    if (req.headers.authorization !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
        return res.status(401).json({ success: false, message: 'Acesso não autorizado.' });
    }

    try {
        const authClient = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        // --- LÓGICA PARA DIFERENTES MÉTODOS HTTP ---

        // Se for um pedido GET, retorna a lista de funcionários
        if (req.method === 'GET') {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: 'A:C', // Colunas cpf, matricula, nome
            });

            const rows = response.data.values || [];
            if (rows.length > 1) { // Garante que há mais do que apenas o cabeçalho
                const employees = rows.slice(1).map(row => ({
                    cpf: row[0],
                    matricula: row[1],
                    nome: row[2]
                }));
                return res.status(200).json({ success: true, employees });
            }
            return res.status(200).json({ success: true, employees: [] });
        }

        // Se for um pedido POST, adiciona um novo funcionário
        if (req.method === 'POST') {
            const { nome, cpf, matricula } = req.body;
            if (!nome || !cpf || !matricula) {
                return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
            }

            await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: 'A1', // A API vai encontrar a próxima linha vazia automaticamente
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [[cpf, matricula, nome]],
                },
            });

            return res.status(201).json({ success: true, message: 'Funcionário adicionado com sucesso!' });
        }

        // Se o método não for GET ou POST
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Método ${req.method} não permitido.`);

    } catch (error) {
        console.error('ERRO NA API DE FUNCIONÁRIOS:', error);
        return res.status(500).json({ success: false, message: `Erro no servidor: ${error.message}` });
    }
};