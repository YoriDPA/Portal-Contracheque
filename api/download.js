// Este é o nosso "proxy" de download.
const { google } = require('googleapis');

module.exports = async (req, res) => {
    // Pega o ID do ficheiro do link (ex: /api/download?fileId=...)
    const { fileId } = req.query;

    if (!fileId) {
        return res.status(400).send('O ID do ficheiro é obrigatório.');
    }

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
            scopes: ['https://www.googleapis.com/auth/drive.readonly'],
        });

        const authClient = await auth.getClient();
        const drive = google.drive({ version: 'v3', auth: authClient });

        // Pede as informações do ficheiro (como o nome original)
        const fileMetadata = await drive.files.get({
            fileId: fileId,
            fields: 'name',
        });
        const fileName = fileMetadata.data.name;

        // Define os cabeçalhos para forçar o download no navegador
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/pdf');

        // Pede o conteúdo do ficheiro como um stream (fluxo de dados)
        const driveResponse = await drive.files.get(
            { fileId: fileId, alt: 'media' },
            { responseType: 'stream' }
        );

        // Envia o fluxo de dados do Google diretamente para o navegador do usuário
        driveResponse.data.pipe(res);

    } catch (error) {
        console.error('Erro ao baixar o ficheiro:', error);
        res.status(500).send('Ocorreu um erro ao tentar baixar o ficheiro.');
    }
};