const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const app = express();
const port = 4000;
const ejs = require('ejs');

// Load environment variables from .env file
dotenv.config();

// Middleware setup
app.use(express.json());
app.set("view engine", 'ejs');
app.use(express.urlencoded({ extended: true }));

// Secret key for signing JWT
const secretKey = process.env.MY_SECRET_KEY || 'defaultSecretKey';

// Sample users
const users = [
    { id: "1", username: "vasudev", password: "vasudev", isAdmin: true },
    { id: "2", username: "dev", password: "dev1234", isAdmin: false }
];

// Home route
app.get('/', (req, res) => {
    res.redirect('/welcome');
});

// Middleware to verify JWT token
const verifyUser = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(" ")[1];

        jwt.verify(token, secretKey, (err, user) => {
            if (err) {
                return res.status(403).json({ error: "Token is not valid" });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(403).json({ error: "You are not authenticated" });
    }
};

// Login route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(person => person.username === username && person.password === password);

    if (user) {
        const accessToken = jwt.sign(
            {
                id: user.id,
                username: user.username,
                isAdmin: user.isAdmin
            },
            secretKey,
            { expiresIn: '1h' }
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

// Delete user route
app.delete('/api/user/:userid', verifyUser, (req, res) => {
    const { userid } = req.params;

    if (req.user.id === userid || req.user.isAdmin) {
        res.status(200).json({ message: "User deleted successfully" });
    } else {
        res.status(401).json({ error: "You are not allowed to delete this user" });
    }
});

// Render specific user views
app.get("/vasudev", (req, res) => {
    res.render("vasudev");
});

app.get("/dev", (req, res) => {
    res.render("dev");
});

// Redirect based on user ID
app.get('/api/login/:userid', (req, res) => {
    const { userid } = req.params;

    if (userid) {
        if (userid === "1") {
            res.redirect('/vasudev');
        } else if (userid === "2") {
            res.redirect('/dev');
        } else {
            res.status(400).json({ error: "User not found" });
        }
    } else {
        res.status(400).json({ error: "User ID is required" });
    }
});

// Logout route
app.post('/api/logout', (req, res) => {
    const userToken = req.headers.authorization;

    if (userToken) {
        const token = userToken.split(" ")[1];
        if (token) {
            let allTokens = [];
            const tokenIndex = allTokens.indexOf(token);

            if (tokenIndex !== -1) {
                allTokens.splice(tokenIndex, 1);
                res.status(200).json("Logout successfully");
                res.redirect('/');
            } else {
                res.status(400).json("You are not a valid user");
            }
        } else {
            res.status(400).json("Token not found");
        }
    } else {
        res.status(400).json("You are not authenticated");
    }
});

// Welcome page
app.get('/welcome', (req, res) => {
    res.render('welcome');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
