import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { hashPassword, requireAdmin } from "@/lib/auth";
import User from "@/models/User";
import { jsonError, jsonSuccess } from "@/lib/utils";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const update: Record<string, unknown> = {};
    if (body.name) update.name = body.name;
    if (body.email) update.email = body.email.toLowerCase();
    if (body.role) update.role = body.role;
    if (typeof body.isActive === "boolean") update.isActive = body.isActive;
    if (typeof body.canEditMealsBazar === "boolean") {
      update.canEditMealsBazar = body.canEditMealsBazar;
    }
    if (body.phone !== undefined) {
      update.phone = String(body.phone).trim();
    }
    if (body.password) update.password = await hashPassword(body.password);

    if (Object.keys(update).length === 0) {
      return jsonError("No valid fields to update");
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return jsonError("User not found", 404);

    return jsonSuccess({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        canEditMealsBazar: user.canEditMealsBazar ?? true,
        phone: user.phone ?? "",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return jsonError(msg, 403);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;

    await User.findByIdAndUpdate(id, { isActive: false });
    return jsonSuccess({ message: "User deactivated" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return jsonError(msg, 403);
  }
}
