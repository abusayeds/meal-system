import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "admin" | "member";
  isActive: boolean;
  canEditMealsBazar: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, trim: true, default: "" },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    isActive: { type: Boolean, default: true },
    canEditMealsBazar: { type: Boolean, default: true },
  },
  { timestamps: true }
);

if (mongoose.models.User) {
  const schema = mongoose.models.User.schema;
  if (!schema.path("canEditMealsBazar") || !schema.path("phone")) {
    mongoose.deleteModel("User");
  }
}

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
