// api/admin-auth.js - API to authenticate the administrator

module.exports = async (req, res) => {
    // CORS Settings
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed.' });
    }

    try {
        const { username, password } = req.body;

        // Get credentials from Vercel Environment Variables
        const adminUser = process.env.ADMIN_USERNAME;
        const adminPass = process.env.ADMIN_PASSWORD;

        // Check if credentials match
        if (username === adminUser && password === adminPass) {
            // Successful login
            res.status(200).json({ success: true, message: 'Authentication successful.' });
        } else {
            // Invalid credentials
            res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }
    } catch (error) {
        console.error('Error in admin authentication:', error);
        res.status(500).json({ success: false, message: 'An error occurred on the server.' });
    }
};
