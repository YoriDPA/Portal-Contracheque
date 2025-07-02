// Este é um arquivo de backend (Node.js) que será uma Serverless Function no Vercel.
// Ele usa as APIs do Google para fazer a autenticação.

// Importa a biblioteca do Google
const { google } = require('googleapis');

// Função principal que o Vercel irá executar
module.exports = async (req, res) => {
    // Permite que o nosso site (frontend) acesse esta API
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Responde a requisições OPTIONS (necessário para o navegador)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Pega o cpf e a matricula enviados pelo formulário de login
    const { cpf, matricula } = req.body;

    if (!cpf || !matricula) {
        return res.status(400).json({ success: false, message: 'CPF e Matrícula são obrigatórios.' });
    }

    try {
        // Autenticação com o Google
        const auth = new google.auth.GoogleAuth({
            // As credenciais são lidas de uma variável de ambiente segura no Vercel
            credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
            scopes: [
                'https://www.googleapis.com/auth/drive.readonly',
                'https://www.googleapis.com/auth/spreadsheets.readonly',
            ],
        });

        const authClient = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });
        const drive = google.drive({ version: 'v3', auth: authClient });

        // --- 1. Verificar na Planilha (Google Sheets) ---
        const sheetResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID, // ID da sua planilha
            range: 'A:C', // Colunas A, B e C
        });