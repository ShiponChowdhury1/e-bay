import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "";

async function addAdmin() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected!\n");

    const email = "nxshipon@gmail.com";
    const password = "ebay12345678";

    // Check if user already exists
    const existingUser = await User.findOne({ email }).select("+password");
    if (existingUser) {
      // Update password, role and verified status
      const hashedPassword = await bcrypt.hash(password, 12);
      existingUser.password = hashedPassword;
      existingUser.role = "admin";
      existingUser.isVerified = true;
      await existingUser.save();
      console.log(`✅ Updated ${email} to admin with new password`);
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(password, 12);
      const admin = await User.create({
        name: "Shipon",
        email: email,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
      });
      console.log(`✅ Admin created: ${admin.email}`);
    }

    console.log(`\n📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}\n`);  } catch (error) {
    console.error(" Failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

addAdmin();
