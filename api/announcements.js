// api/announcements.js - API para gerir o Quadro de Avisos (com correção)

const { google } = require('googleapis');

// Função de autenticação reutilizável
async function getAuthClient() {
    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return await auth.getClient();
}

// Função principal
module.exports = async (req, res) => {
    // Configurações de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const authClient = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        const sheetName = 'Avisos'; // O nome da nova página na sua planilha

        // GET: Retorna a lista de todos os avisos
        if (req.method === 'GET') {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `${sheetName}!A:C`, // Colunas: data, titulo, mensagem
            });
            const rows = response.data.values || [];
            if (rows.length > 1) {
                const announcements = rows.slice(1).map((row, index) => ({
                    date: row[0],
                    title: row[1],
                    message: row[2],
                    rowIndex: index + 2
                })).reverse(); // Mostra os mais recentes primeiro
                return res.status(200).json({ success: true, announcements });
            }
            return res.status(200).json({ success: true, announcements: [] });
        }

        // Apenas administradores podem criar ou apagar
        if (req.headers.authorization !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
            return res.status(401).json({ success: false, message: 'Acesso não autorizado.' });
        }

        // POST: Adiciona um novo aviso
        if (req.method === 'POST') {
            const { title, message } = req.body;
            if (!title || !message) {
                return res.status(400).json({ success: false, message: 'Título e mensagem são obrigatórios.' });
            }
            const date = new Date().toLocaleDateString('pt-BR'); // Data atual
            await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: `${sheetName}!A1`,
                valueInputOption: 'USER_ENTERED',
                resource: { values: [[date, title, message]] },
            });
            return res.status(201).json({ success: true, message: 'Aviso publicado com sucesso!' });
        }

        // DELETE: Apaga um aviso (limpando o conteúdo da linha)
        if (req.method === 'DELETE') {
            const { rowIndex } = req.body;
            if (!rowIndex) {
                return res.status(400).json({ success: false, message: 'Falta o identificador da linha para apagar.' });
            }
            // **CORREÇÃO AQUI:** Limpa o conteúdo da linha em vez de a apagar, o que é mais seguro.
            const rangeToClear = `${sheetName}!A${rowIndex}:C${rowIndex}`;
            await sheets.spreadsheets.values.clear({
                spreadsheetId,
                range: rangeToClear,
            });
            return res.status(200).json({ success: true, message: 'Aviso apagado com sucesso!' });
        }

        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).end(`Método ${req.method} não permitido.`);

    } catch (error) {
        console.error('ERRO NA API DE AVISOS:', error);
        return res.status(500).json({ success: false, message: `Erro no servidor: ${error.message}` });
    }
};
