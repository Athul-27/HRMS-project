const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI)
.then(async () => {

    await User.deleteOne({
        email: "admin@hrms.com"
    });

    await User.create({
        name: "Administrator",
        email: "admin@hrms.com",
        password: "Admin@123",
        role: "Admin"
    });

    console.log("Admin created.");

    process.exit();

})
.catch(err=>{
    console.error(err);
    process.exit(1);
});