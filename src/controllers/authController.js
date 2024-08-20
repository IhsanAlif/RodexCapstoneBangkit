const db = require('../config/db');

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send('Username, email, or password is missing');
  }

  try {
    await db.collection('users').add({ username, email, password });
    res.send(`Registered user: ${username}`);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const snapshot = await db.collection('users')
      .where('username', '==', username)
      .where('password', '==', password)
      .get();

    if (snapshot.empty) {
      return res.status(404).send('User not found');
    }

    res.send(`Logged in user: ${username}`);
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).send('Error logging in user');
  }
};

module.exports = { registerUser, loginUser };
