const db = require('../config/db');
const bcrypt = require('bcrypt');
const saltRounds = 10; // Number of salt rounds for bcrypt

// Function to register a new user
exports.registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).send('Username, email, password, or role is missing');
    }

    try {
        // Check if the email or username already exists
        const existingUserSnapshot = await db.collection('users')
            .where('email', '==', email)
            .get();
        
        const existingUsernameSnapshot = await db.collection('users')
            .where('username', '==', username)
            .get();

        if (!existingUserSnapshot.empty) {
            return res.status(400).send('Email already exists');
        }

        if (!existingUsernameSnapshot.empty) {
            return res.status(400).send('Username already exists');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Save user with hashed password
        const userRef = await db.collection('users').add({ username, email, password: hashedPassword, role });
        const userId = userRef.id; // Get the ID of the newly created user

        res.status(201).json({ userId, username, email, role });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
};

// Function to log in a user
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const snapshot = await db.collection('users').where('username', '==', username).get();
        if (snapshot.empty) {
            res.status(404).send('User not found');
            return;
        }

        const user = snapshot.docs[0].data();
        const userId = snapshot.docs[0].id;
        const hashedPassword = user.password;

        // Compare provided password with stored hashed password
        const match = await bcrypt.compare(password, hashedPassword);

        if (match) {
            res.status(200).json({
                userId, 
                username, 
                email: user.email, 
                role: user.role });
        } else {
            res.status(401).send('Invalid password');
        }
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).send('Error logging in user');
    }
};

// Function to get user details by ID
exports.getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const userDoc = await db.collection('users').doc(id).get();
        if (!userDoc.exists) {
            return res.status(404).send('User not found');
        }

        const user = userDoc.data();
        res.status(200).json({ id: userDoc.id, ...user });
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).send('Error getting user');
    }
};

// Function to update user information
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, email, password, role } = req.body;

    try {
        const userDoc = db.collection('users').doc(id);
        const user = (await userDoc.get()).data();

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Update user fields
        const updatedUser = {
            username: username || user.username,
            email: email || user.email,
            role: role || user.role,
        };

        if (password) {
            // Hash new password if provided
            updatedUser.password = await bcrypt.hash(password, saltRounds);
        }

        await userDoc.update(updatedUser);
        res.status(200).json({ id, ...updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Error updating user');
    }
};
