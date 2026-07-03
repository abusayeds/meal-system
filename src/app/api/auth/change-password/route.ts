import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import {
  hashPassword,
  requireSession,
  verifyPassword,
} from "@/lib/auth";
import User from "@/models/User";
import { jsonError, jsonSuccess } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    await connectDB();

    const { currentPassword, newPassword, confirmPassword } =
      await request.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return jsonError("Current password, new password and confirmation are required");
    }

    if (newPassword.length < 6) {
      return jsonError("New password must be at least 6 characters");
    }

    if (newPassword !== confirmPassword) {
      return jsonError("New passwords do not match");
    }

    if (currentPassword === newPassword) {
      return jsonError("New password must be different from current password");
    }

    const user = await User.findById(session.id);
    if (!user) return jsonError("User not found", 404);

    if (!user.isActive) {
      return jsonError("Account is inactive", 403);
    }

    const valid = await verifyPassword(currentPassword, user.password);
    if (!valid) {
      return jsonError("Current password is incorrect");
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    return jsonSuccess({ message: "Password changed successfully" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return jsonError(msg, msg === "Unauthorized" ? 401 : 500);
  }
}
