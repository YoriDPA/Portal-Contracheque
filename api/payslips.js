// api/payslips.js - A nossa API para gerir ficheiros de contracheque

const { google } = require('googleapis');

// Função de autenticação reutilizável
async function getAuthClient() {
    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
        scopes: ['https://www.googleapis.com/auth/drive'], // Permissão total para o Drive
    });
    return await auth.getClient();
}

// Função principal que o Vercel irá executar
module.exports = async (req, res) => {
    // Configurações de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
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
        const drive = google.drive({ version: 'v3', auth: authClient });

        // Se for um pedido GET, lista os ficheiros de um funcionário
        if (req.method === 'GET') {
            const { matricula } = req.query;
            if (!matricula) {
                return res.status(400).json({ success: false, message: 'A matrícula é obrigatória.' });
            }

            const response = await drive.files.list({
                q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and name starts with '${matricula}_' and mimeType='application/pdf'`,
                fields: 'files(id, name)',
                orderBy: 'name desc',
            });

            return res.status(200).json({ success: true, files: response.data.files });
        }

        // Se for um pedido DELETE, apaga um ficheiro específico
        if (req.method === 'DELETE') {
            const { fileId } = req.body;
            if (!fileId) {
                return res.status(400).json({ success: false, message: 'O ID do ficheiro é obrigatório.' });
            }

            await drive.files.delete({
                fileId: fileId,
            });

            return res.status(200).json({ success: true, message: 'Ficheiro apagado com sucesso!' });
        }

        res.setHeader('Allow', ['GET', 'DELETE']);
        return res.status(405).end(`Método ${req.method} não permitido.`);

    } catch (error) {
        console.error('ERRO NA API DE CONTRACHEQUES:', error);
        return res.status(500).json({ success: false, message: `Erro no servidor: ${error.message}` });
    }
};
