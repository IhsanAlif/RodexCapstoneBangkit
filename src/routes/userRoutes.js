const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route for registering a new user
router.post('/register', userController.registerUser);

// Route for logging in a user
router.post('/login', userController.loginUser);

// Route for updating user information
router.put('/update/:id', userController.updateUser);

// Route for getting a user by username
router.get('/user/:username', userController.getUserById);

module.exports = router;
