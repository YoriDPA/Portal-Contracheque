// api/upload.js - A nossa API para carregar contracheques

const { google } = require('googleapis');
const { Readable } = require('stream');

// Função de autenticação reutilizável
async function getAuthClient() {
    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
        scopes: ['https://www.googleapis.com/auth/drive'],
    });
    return await auth.getClient();
}

// Função principal que o Vercel irá executar
module.exports = async (req, res) => {
    // Configurações de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Segurança básica: verifica a senha de admin
    if (req.headers.authorization !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
        return res.status(401).json({ success: false, message: 'Acesso não autorizado.' });
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Método ${req.method} não permitido.`);
    }

    try {
        const { matricula, ano, mes, fileData, fileType } = req.body;

        if (!matricula || !ano || !mes || !fileData || !fileType) {
            return res.status(400).json({ success: false, message: 'Faltam dados para o upload.' });
        }

        const authClient = await getAuthClient();
        const drive = google.drive({ version: 'v3', auth: authClient });

        // Constrói o nome do ficheiro padrão: MATRICULA_ANO_MES.pdf
        const fileName = `${matricula}_${ano}_${mes.padStart(2, '0')}.pdf`;
        
        // Converte o ficheiro de base64 para um buffer
        const fileBuffer = Buffer.from(fileData.split(',')[1], 'base64');
        const fileStream = Readable.from(fileBuffer);

        const fileMetadata = {
            name: fileName,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // ID da sua pasta "Contracheques"
        };

        const media = {
            mimeType: fileType,
            body: fileStream,
        };

        // Usa a API do Drive para criar o ficheiro
        await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });

        return res.status(200).json({ success: true, message: `Contracheque "${fileName}" carregado com sucesso!` });

    } catch (error) {
        console.error('ERRO NA API DE UPLOAD:', error);
        return res.status(500).json({ success: false, message: `Erro no servidor: ${error.message}` });
    }
};
