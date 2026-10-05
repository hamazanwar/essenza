require("dotenv").config();

const bcrypt = require("bcrypt");
const connectDB = require("./config/db");
const Admin = require("./models/Admin");

const createAdmin = async () => {
    try {
        await connectDB();

        const existingAdmin = await Admin.findOne({
            email: "essenza.store.perfume@gmail.com"
        });

        if (existingAdmin) {
            console.log("Admin already exists");
            process.exit();
        }

        const hashedPassword = await bcrypt.hash(
            "admin123",
            10
        );

        await Admin.create({
            name: "ESSENZA Admin",
            email: "essenza.store.perfume@gmail.com",
            password: hashedPassword,
            role: "admin"
        });

        console.log("Admin created successfully");

        process.exit();

    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
};

createAdmin();