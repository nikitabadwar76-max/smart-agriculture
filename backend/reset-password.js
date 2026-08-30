const bcrypt = require("bcryptjs");
const db = require("./db");

async function resetPassword() {
    try {
        const mobile = "9657140273";
        const newPassword = "test123";

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        await db.query(
            `UPDATE farmers
             SET password = ?
             WHERE mobile = ?`,
            [hashedPassword, mobile]
        );

        console.log("✅ Farmer password reset successfully");
        console.log("Mobile:", mobile);
        console.log("New password:", newPassword);

        process.exit(0);

    } catch (error) {
        console.error("❌ Password reset error:", error);
        process.exit(1);
    }
}

resetPassword();