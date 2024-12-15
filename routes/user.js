const { Router } = require("express");
const { Admin } = require("../db");
const jwt = require("jsonwebtoken");
const path = require("path");

const JWT_SECRET = "secret"; // Replace with your actual secret
const router = Router();


router.post('/signup', (req, res) => {
        // Implement user signup logic
        const username = req.body.username;
        const password = req.body.password;
        User.create({
            username, 
            password
        })
        res.json({
            message: "User created successfully"
        })
    });

router.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await User.findOne({ username, password });

        if (!admin) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Generate a JWT token
        const token = jwt.sign({ username }, JWT_SECRET);

        // Return the token to the frontend
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error signing in" });
    }
});

// User Data Endpoint
router.get('/user/data', async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, JWT_SECRET);
        const username = decoded.username;

        // You can fetch additional user data here if needed
        res.json({ username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching user data" });
    }
});

module.exports = router;
