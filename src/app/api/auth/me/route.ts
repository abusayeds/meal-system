import { getActiveSession } from "@/lib/auth";
import { memberCanEdit } from "@/lib/edit-permissions";
import { jsonError, jsonSuccess } from "@/lib/utils";

export async function GET() {
  const session = await getActiveSession();
  if (!session) {
    return jsonError("Unauthorized", 401);
  }

  const canEdit =
    session.role === "admin" ? true : await memberCanEdit(session.id);

  return jsonSuccess({
    user: {
      ...session,
      canEdit,
    },
  });
}
