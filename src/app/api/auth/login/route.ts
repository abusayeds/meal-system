import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import {
  createToken,
  ensureDefaultAdmin,
  setAuthCookie,
  verifyPassword,
} from "@/lib/auth";
import User from "@/models/User";
import { jsonError, jsonSuccess } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    await ensureDefaultAdmin();

    const { email, password } = await request.json();

    if (!email || !password) {
      return jsonError("Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase(), isActive: true });
    if (!user) {
      return jsonError("Invalid credentials", 401);
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return jsonError("Invalid credentials", 401);
    }

    const sessionUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role as "admin" | "member",
    };

    const token = await createToken(sessionUser);
    await setAuthCookie(token);

    return jsonSuccess({ user: sessionUser });
  } catch (error) {
    console.error("Login error:", error);
    const message =
      error instanceof Error && process.env.NODE_ENV === "development"
        ? error.message
        : "Login failed";
    return jsonError(message, 500);
  }
}
