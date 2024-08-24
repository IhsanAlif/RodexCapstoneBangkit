const db = require('../config/db');
const bcrypt = require('bcrypt');
const saltRounds = 10; // Number of salt rounds for bcrypt

exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send('Username, email, or password is missing');
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Save user with hashed password
        await db.collection('users').add({ username, email, password: hashedPassword });
        res.send(`Registered user: ${username}`);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
};

exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const snapshot = await db.collection('users').where('username', '==', username).get();
        if (snapshot.empty) {
            res.status(404).send('User not found');
            return;
        }

        const user = snapshot.docs[0].data();
        const hashedPassword = user.password;

        // Compare provided password with stored hashed password
        const match = await bcrypt.compare(password, hashedPassword);

        if (match) {
            res.send(`Logged in user: ${username}`);
        } else {
            res.status(401).send('Invalid password');
        }
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).send('Error logging in user');
    }
};
