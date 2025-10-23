import User from "../models/User";
import connectDB from "../config/database/connection";
import dotenv from "dotenv";

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await connectDB();

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
    const superAdminName = process.env.SUPER_ADMIN_NAME || "Super Admin";
    const superAdminPhone = process.env.SUPER_ADMIN_PHONE || "+2349099909990";

    if (!superAdminEmail || !superAdminPassword) {
      console.error(" Super admin credentials not found in .env file");
      process.exit(1);
    }

    const existingAdmin = await User.findOne({ email: superAdminEmail });

    if (existingAdmin) {
      console.log(" Super admin already exists with email:", superAdminEmail);
      console.log("   Name:", existingAdmin.name);
      console.log("   Role:", existingAdmin.role);
      console.log("   Email Verified:", existingAdmin.isEmailVerified);
      process.exit(0);
    }

    // Create super admin
    const superAdmin = await User.create({
      name: superAdminName,
      email: superAdminEmail,
      password: superAdminPassword,
      phone: superAdminPhone,
      role: "admin",
      isEmailVerified: true, 
      verificationCode: null,
      verificationCodeExpires: null,
    });

    console.log(" Super admin created successfully!");
    console.log("   Email:", superAdmin.email);
    console.log("   Name:", superAdmin.name);
    console.log("   Role:", superAdmin.role);
    console.log("   ID:", superAdmin._id);
    console.log("\n You can now login with:");
    console.log("   Email:", superAdminEmail);
    console.log("   Password: [hidden]");

    process.exit(0);
  } catch (error: any) {
    console.error(" Error seeding super admin:", error.message);
    process.exit(1);
  }
};

seedSuperAdmin();
