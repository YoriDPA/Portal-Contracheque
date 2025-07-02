// Este é um arquivo de backend (Node.js) que será uma Serverless Function no Vercel.
// Ele usa as APIs do Google para fazer a autenticação.

const { google } = require('googleapis');

// Função principal que o Vercel irá executar
module.exports = async (req, res) => {
    // Permite que o nosso site (frontend) acesse esta API
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const { cpf, matricula } = req.body;

    if (!cpf || !matricula) {
        return res.status(400).json({ success: false, message: 'CPF e Matrícula são obrigatórios.' });
    }

    try {
        const auth = new google.auth.GoogleAuth({
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
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'A:C', 
        });
        
        const rows = sheetResponse.data.values;

        // **NOVA VERIFICAÇÃO DE ERRO**
        if (!rows || rows.length === 0) {
            // Se não conseguiu ler as linhas, envia um erro claro.
            return res.status(500).json({ success: false, message: 'Erro: Não foi possível ler a planilha. Verifique as permissões e o ID da planilha.' });
        }
        
        const header = rows.shift(); 
        const employee = rows.find(row => row && row[0] === cpf && row[1] === matricula);

        if (!employee) {
            return res.status(401).json({ success: false, message: 'CPF ou Matrícula inválidos.' });
        }

        // --- 2. Buscar Arquivos no Drive ---
        const driveResponse = await drive.files.list({
            q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and name starts with '${matricula}_' and mimeType='application/pdf'`,
            fields: 'files(id, name, webViewLink, webContentLink)',
            orderBy: 'name desc',
        });

        const files = driveResponse.data.files;
        
        return res.status(200).json({ 
            success: true, 
            message: 'Login bem-sucedido!',
            employeeName: employee[2], 
            files: files.map(file => ({
                name: file.name,
                id: file.id,
                viewLink: file.webViewLink,
                downloadLink: file.webContentLink
            }))
        });

    } catch (error) {
        console.error('ERRO NA API:', error);
        // Envia uma mensagem de erro mais detalhada
        return res.status(500).json({ success: false, message: `Erro no servidor: ${error.message}` });
    }
};