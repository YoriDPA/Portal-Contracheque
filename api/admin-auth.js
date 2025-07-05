// api/admin-auth.js - API para autenticar o administrador

module.exports = async (req, res) => {
    // Configurações de CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido.' });
    }

    try {
        const { username, password } = req.body;

        // Pega as credenciais das variáveis de ambiente no Vercel
        const adminUser = process.env.ADMIN_USERNAME;
        const adminPass = process.env.ADMIN_PASSWORD;

        // Verifica se as credenciais correspondem
        if (username === adminUser && password === adminPass) {
            // Login bem-sucedido
            res.status(200).json({ success: true, message: 'Autenticação bem-sucedida.' });
        } else {
            // Credenciais inválidas
            res.status(401).json({ success: false, message: 'Utilizador ou senha inválidos.' });
        }
    } catch (error) {
        console.error('Erro na autenticação do admin:', error);
        res.status(500).json({ success: false, message: 'Ocorreu um erro no servidor.' });
    }
};