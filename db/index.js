// const mongoose = require('mongoose');

// // Connect to MongoDB
// mongoose.connect(
//     "mongodb+srv://ashwinkhowala1:G3UAjsUJEkbxrtE1@cluster0.j6l3z.mongodb.net/MLSA_DATASET",
//   );
// // Define schemas
// const AdminSchema = new mongoose.Schema({
//     // Schema definition here
//     username: String,
//     password: String
// });




// const Admin = mongoose.model('Admin', AdminSchema);

// module.exports = {
//     Admin
//     // Course
// }
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(
    "mongodb+srv://ashwinkhowala1:G3UAjsUJEkbxrtE1@cluster0.j6l3z.mongodb.net/MLSA_DATASET",
  );
// Define schemas
const AdminSchema = new mongoose.Schema({
    // Schema definition here
    username: String,
    password: String
});


const healthProfile = new mongoose.Schema({
    // Schema definition here
    username: {
        type: String,
        required: true,
        ref: "Admin", // Reference to Admin schema
    },
    username:String,
    fullName: String,
        age: Number,
        gender: String,
        anxiety: String,
        depression: String,
        sleep: String,
        chronicPain: {
            hasPain: Boolean,
            painLocation: String,
            painIntensity: Number,
        },
        ptsd: String,
        adhd: String,
        stress: String,
        exercise: String,
        diet: String,
        screenTime: Number,
        social: String,
});



const Admin = mongoose.model('Admin', AdminSchema);
const Users = mongoose.model('Userhearthprofile', healthProfile);

module.exports = {
    Admin,
    Users
}



