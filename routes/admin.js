const { Router } = require("express");
const { Admin, Users } = require("../db");
// const SavedTherapy = require("../db/therapySchema");
const jwt = require("jsonwebtoken");
const path = require("path");

const JWT_SECRET = "secret"; 
const router = Router();

router.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        // Check if the username already exists
        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists!" });
        }

        // Create a new admin
        const admin = new Admin({
            username: username,
            password: password
        });

        const admin_data = await admin.save();
        if (!admin_data) {
            return res.status(500).json({ message: "Error saving admin data" });
        }

        const token = jwt.sign({ username }, JWT_SECRET);
        res.status(200).json({ message: "Successfully registered", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error signing up" });
    }
});



router.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await Admin.findOne({ username, password });

        if (!admin) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign({ username }, JWT_SECRET);

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error signing in" });
    }
});


router.get('/user/data', async (req, res) => {
    console.log('hi');
    
    const token = req.headers.authorization;
    console.log(token);

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, JWT_SECRET);
        const username = decoded.username;

        // Fetch user-specific data from the database
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(404).json({ message: "User not found" });
        }

        // Send user-specific data
        res.json({
            name: admin.username,
            todaySessions: 3,
            completedTherapy: "75%",
            musicTime: "2 hrs 30 min",
            streak: "7 Days",
        });
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: "Invalid or expired token" });
    }
});


router.post('/health-profile', async (req, res) => {
    const healthProfileData = req.body;

    try {
        // Validate the healthProfile data
        if (!healthProfileData || Object.keys(healthProfileData).length === 0) {
            return res.status(400).json({ message: 'Health profile data is required' });
        }

        // Save the health profile data
        const healthProfile = new Users(healthProfileData);

        const savedProfile = await healthProfile.save();
        if (!savedProfile) {
            return res.status(500).json({ message: 'Error saving health profile' });
        }

        // Respond with success message
        res.status(200).json({ message: 'Health profile updated successfully', data: savedProfile });
    } catch (error) {
        console.error('Error updating health profile:', error);
        res.status(500).json({ message: 'An error occurred while updating the health profile' });
    }
});

// Fetch health profile by username
router.get('/health-profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader;
        
        // Verify token and get username
        const decoded = jwt.verify(token, JWT_SECRET);
        const username = decoded.username;

        // Find health profile where fullName matches username
        const healthProfile = await Users.findOne({ fullName: username });

        if (!healthProfile) {
            return res.status(404).json({ message: 'Health profile not found' });
        }

        res.json(healthProfile);
    } catch (error) {
        console.error('Error fetching health profile:', error);
        res.status(500).json({ message: 'Error fetching health profile' });
    }
});

// Fetch all health profiles
router.get('/all-health-profiles', async (req, res) => {
    try {
        const healthProfiles = await Users.find({});
        res.json(healthProfiles);
    } catch (error) {
        console.error('Error fetching health profiles:', error);
        res.status(500).json({ message: 'Error fetching health profiles' });
    }
});

const authenticateJwt = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: "Invalid token" });
            }

            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ message: "Access denied. No token provided." });
    }
};

// router.post('/save-therapy', authenticateJwt, async (req, res) => {
//     try {
//         const { therapyContent } = req.body;
//         const username = req.user.username;

//         // Parse the therapy content to extract information
//         const lines = therapyContent.split('\n');
//         let genre = '', songs = [], benefits = '';
        
//         lines.forEach(line => {
//             if (line.toLowerCase().includes('genre:')) {
//                 genre = line.split(':')[1].trim();
//             } else if (line.toLowerCase().includes('songs:') || line.toLowerCase().includes('recommendations:')) {
//                 songs = line.split(':')[1].trim().split(',').map(song => song.trim());
//             } else if (line.toLowerCase().includes('benefits:') || line.toLowerCase().includes('how this music can help:')) {
//                 benefits = line.split(':')[1].trim();
//             }
//         });

//         const savedTherapy = new SavedTherapy({
//             username,
//             therapyContent,
//             genre,
//             songs,
//             benefits
//         });

//         await savedTherapy.save();
//         res.status(200).json({ message: "Therapy saved successfully" });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Error saving therapy" });
//     }
// });

// router.get('/saved-therapies', authenticateJwt, async (req, res) => {
//     try {
//         const username = req.user.username;
//         const savedTherapies = await SavedTherapy.find({ username }).sort({ savedAt: -1 });
//         res.status(200).json(savedTherapies);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Error fetching saved therapies" });
//     }
// });

// router.delete('/delete-therapy/:id', authenticateJwt, async (req, res) => {
//     try {
//         const username = req.user.username;
//         const therapyId = req.params.id;
        
//         const therapy = await SavedTherapy.findOne({ _id: therapyId, username });
//         if (!therapy) {
//             return res.status(404).json({ message: "Therapy not found or unauthorized" });
//         }
        
//         await SavedTherapy.deleteOne({ _id: therapyId });
//         res.status(200).json({ message: "Therapy deleted successfully" });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Error deleting therapy" });
//     }
// });

module.exports = router;
