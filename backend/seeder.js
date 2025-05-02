import dotenv from "dotenv";
import mongoose from "mongoose";
import users from "./data/users.js";
import connectDB from "./config/db.js";
import User from "./models/userModel.js";

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();

    // Insert users
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;

    console.log("Data Imported Successfully");
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log("Data Destroyed Successfully");
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
