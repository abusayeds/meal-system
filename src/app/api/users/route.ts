import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { hashPassword, requireAdmin } from "@/lib/auth";
import User from "@/models/User";
import { jsonError, jsonSuccess } from "@/lib/utils";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    await User.updateMany(
      { canEditMealsBazar: { $exists: false } },
      { $set: { canEditMealsBazar: true } }
    );
    await User.updateMany(
      { phone: { $exists: false } },
      { $set: { phone: "" } }
    );

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return jsonSuccess({
      users: users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        canEditMealsBazar: u.canEditMealsBazar ?? true,
        phone: u.phone ?? "",
        createdAt: u.createdAt,
      })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return jsonError(msg, msg === "Unauthorized" || msg === "Forbidden" ? 403 : 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { name, email, password, role, phone } = await request.json();

    if (!name || !email || !password) {
      return jsonError("Name, email and password are required");
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return jsonError("Email already exists");
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: await hashPassword(password),
      role: role === "admin" ? "admin" : "member",
      isActive: true,
      canEditMealsBazar: true,
      phone: phone?.trim() ?? "",
    });

    return jsonSuccess({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    }, 201);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return jsonError(msg, msg === "Unauthorized" || msg === "Forbidden" ? 403 : 500);
  }
}
