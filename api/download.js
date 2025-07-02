// Este é o nosso "proxy" de download e visualização.
const { google } = require('googleapis');

module.exports = async (req, res) => {
    // Pega o ID do ficheiro e a ação desejada (view ou download)
    const { fileId, action } = req.query;

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

        // **NOVA LÓGICA AQUI**
        // Define se o ficheiro deve ser visualizado no navegador ('inline') ou baixado ('attachment')
        const disposition = action === 'view' ? 'inline' : 'attachment';

        // Define os cabeçalhos para o navegador
        res.setHeader('Content-Disposition', `${disposition}; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/pdf');

        // Pede o conteúdo do ficheiro como um stream (fluxo de dados)
        const driveResponse = await drive.files.get(
            { fileId: fileId, alt: 'media' },
            { responseType: 'stream' }
        );

        // Envia o fluxo de dados do Google diretamente para o navegador do usuário
        driveResponse.data.pipe(res);

    } catch (error) {
        console.error('Erro ao processar o ficheiro:', error);
        res.status(500).send('Ocorreu um erro ao tentar processar o ficheiro.');
    }
};
