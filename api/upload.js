import { google } from 'googleapis';
import busboy from 'busboy';
import jwt from 'jsonwebtoken';

// Esta função converte um stream em um buffer, necessário para o upload
async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // --- Autenticação JWT ---
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header missing' });
    }
    const token = authHeader.split(' ')[1];

    try {
        jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
    // --- Fim da Autenticação ---

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });
    const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    const bb = busboy({ headers: req.headers });
    const files = [];
    const fields = {};

    bb.on('file', (name, file, info) => {
        const { filename, encoding, mimeType } = info;
        files.push({
            fileStream: file,
            fileName: filename,
            mimeType: mimeType,
        });
    });

    bb.on('field', (name, val) => {
        fields[name] = val;
    });

    bb.on('finish', async () => {
        let successCount = 0;
        let errors = [];

        for (const file of files) {
            try {
                // AJUSTE: Expressão regular para aceitar "_" ou "." como separadores
                const namePattern = /^(\d+)[_.](\d{4})[_.](\d{2})\.pdf$/i;
                const match = file.fileName.match(namePattern);

                if (!match) {
                    throw new Error('Nome do arquivo fora do padrão (MATRICULA_ANO_MES.pdf ou MATRICULA.ANO.MES.pdf)');
                }

                // Desestruturação para pegar os valores capturados pela regex
                const [, employeeId, year, month] = match;

                const fileBuffer = await streamToBuffer(file.fileStream);

                const fileMetadata = {
                    name: file.fileName,
                    parents: [parentFolderId],
                    description: `Contracheque para matrícula ${employeeId} referente a ${month}/${year}.`,
                };

                const media = {
                    mimeType: file.mimeType,
                    body: Buffer.from(fileBuffer),
                };

                await drive.files.create({
                    resource: fileMetadata,
                    media: media,
                    fields: 'id',
                });
                successCount++;

            } catch (error) {
                console.error(`Erro ao fazer upload do arquivo ${file.fileName}:`, error);
                errors.push({ file: file.fileName, error: error.message || 'Erro desconhecido' });
            }
        }
        
        if (errors.length > 0) {
            return res.status(207).json({ 
                message: 'Processamento concluído com alguns erros.',
                successCount,
                errors,
            });
        }

        res.status(200).json({ 
            message: 'Todos os arquivos foram enviados com sucesso!',
            successCount,
            errors,
        });
    });
    
    req.pipe(bb);
}
