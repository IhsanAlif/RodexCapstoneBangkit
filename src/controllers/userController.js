const bcrypt = require('bcrypt');
const saltRounds = 10;

// Import SQLite database instance from db.js
const db = require('../config/db');

// Function to register a new user
exports.registerUser = (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).send('Username, email, password, or role is missing');
    }

    // Check if the email or username already exists
    db.get(
        `SELECT * FROM users WHERE email = ? OR username = ?`,
        [email, username],
        (err, row) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Database error');
            }
            if (row) {
                if (row.email === email) return res.status(400).send('Email already exists');
                if (row.username === username) return res.status(400).send('Username already exists');
            }

            // Hash the password without async/await
            bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
                if (err) {
                    console.error('Error hashing password:', err);
                    return res.status(500).send('Error registering user');
                }

                // Insert the new user
                db.run(
                    `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
                    [username, email, hashedPassword, role],
                    function (err) {
                        if (err) {
                            console.error('Error inserting user:', err);
                            return res.status(500).send('Error registering user');
                        }
                        res.status(201).json({ userId: this.lastID, username, email, role });
                    }
                );
            });
        }
    );
};

// Function to log in a user
exports.loginUser = (req, res) => {
    const { username, password } = req.body;

    db.get(
        `SELECT * FROM users WHERE username = ?`,
        [username],
        (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Database error');
            }
            if (!user) {
                return res.status(404).send('User not found');
            }

            // Compare provided password with stored hashed password
            bcrypt.compare(password, user.password, (err, match) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    return res.status(500).send('Error logging in user');
                }

                if (match) {
                    res.status(200).json({
                        userId: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                    });
                } else {
                    res.status(401).send('Invalid password');
                }
            });
        }
    );
};

// Function to get user details by ID
exports.getUserById = (req, res) => {
    const { id } = req.params;

    db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, user) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error');
        }
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.status(200).json(user);
    });
};

// Function to update user information
exports.updateUser = (req, res) => {
    const { id } = req.params;
    const { username, email, password, role } = req.body;

    db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, user) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error');
        }
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Prepare the updated user fields
        const updatedUser = {
            username: username || user.username,
            email: email || user.email,
            role: role || user.role,
            password: password ? bcrypt.hashSync(password, saltRounds) : user.password,
        };

        db.run(
            `UPDATE users SET username = ?, email = ?, password = ?, role = ? WHERE id = ?`,
            [updatedUser.username, updatedUser.email, updatedUser.password, updatedUser.role, id],
            function (err) {
                if (err) {
                    console.error('Error updating user:', err);
                    return res.status(500).send('Error updating user');
                }
                res.status(200).json({ id, ...updatedUser });
            }
        );
    });
};
