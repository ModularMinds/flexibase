import { userService } from "../services/user.service";
import { authService } from "../services/auth.service";
import { prisma } from "../config/prisma";

async function main() {
  console.log("🚀 Starting Manual Verification on Real DB...");

  const email = `verify_${Date.now()}@example.com`;
  const password = "Password123!";

  try {
    // 1. Create User
    console.log(`1. Creating user: ${email}`);
    const user = await userService.createUser({
      email,
      password,
      name: "Verification User",
    });
    console.log("   ✅ User created:", user.id);

    // 2. Login (Verify Password)
    console.log("2. Verifying credentials...");
    const loggedInUser = await authService.verifyCredentials(email, password);
    if (loggedInUser.id !== user.id)
      throw new Error("ID mismatch during login");
    console.log("   ✅ Login successful");

    // 3. Update Profile
    console.log("3. Updating profile...");
    const updated = await userService.updateUser(user.id, { bio: "I am real" });
    if (updated.bio !== "I am real") throw new Error("Update failed");
    console.log("   ✅ Profile updated");

    // 4. Change Password
    console.log("4. Changing password...");
    const newPassword = "NewPassword789!";
    await authService.changePassword(user.id, password, newPassword);
    console.log("   ✅ Password changed");

    // 5. Verify New Credentials
    console.log("5. Verifying NEW credentials...");
    const loggedInNew = await authService.verifyCredentials(email, newPassword);
    if (!loggedInNew) throw new Error("Login with new password failed");
    console.log("   ✅ Login with new password successful");

    // 6. Verify Old Credentials (Should Fail)
    console.log("6. Verifying OLD credentials (should fail)...");
    try {
      await authService.verifyCredentials(email, password);
      throw new Error("Login with old password SHOULD have failed");
    } catch (err: any) {
      if (err.statusCode === 401) {
        console.log("   ✅ Old password rejected as expected");
      } else {
        throw err;
      }
    }

    // 7. Suspend User
    console.log("7. Suspending User...");
    await userService.updateUserStatus(user.id, false);
    console.log("   ✅ User suspended");

    // 8. Verify Suspension (Login Should Fail)
    console.log("8. Verifying Suspension (Login should fail)...");
    try {
      await authService.verifyCredentials(email, newPassword);
      throw new Error("Login SUSPENDED user SHOULD have failed");
    } catch (err: any) {
      if (err.statusCode === 403) {
        console.log("   ✅ Suspended login rejected as expected");
      } else {
        throw err;
      }
    }

    // 9. Activate User
    console.log("9. Activating User...");
    await userService.updateUserStatus(user.id, true);
    console.log("   ✅ User activated");

    // 10. Verify Activation (Login Should Success)
    console.log("10. Verifying Activation...");
    await authService.verifyCredentials(email, newPassword);
    console.log("   ✅ Activated login successful");

    // 11. Delete User (Cleanup)
    console.log("11. Cleanup (Deleting user)...");
    await userService.deleteUser(user.id);
    console.log("   ✅ User deleted");

    console.log("🎉 VERIFICATION SUCCESSFUL!");
  } catch (error) {
    console.error("❌ VERIFICATION FAILED:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
