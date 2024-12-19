const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken package
const app = express();
const port = 4000;

// Load environment variables from .env file
dotenv.config();

// Middleware to parse JSON requests
app.use(express.json());

// Secret key for signing JWT
const secretKey = process.env.MY_SECRET_KEY || 'defaultSecretKey';

// Sample users
const users = [
    {
        id: "1",
        username: "vasudev",
        password: "vasudev",
        isAdmin: true
    },
    {
        id: "2",
        username: "dev",
        password: "dev1234",
        isAdmin: false
    }
];

// Home route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Login route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(person =>
        person.username === username && person.password === password
    );

    if (user) {
        // Generate a JWT access token
        const accessToken = jwt.sign(
            { id: user.id, isAdmin: user.isAdmin },
            secretKey,  // Using the secret key from the .env file
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        res.json({
            username: user.username,
            isAdmin: user.isAdmin,
            accessToken
        });
    } else {
        res.status(401).json({ error: "User credentials do not match" });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
