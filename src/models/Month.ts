import mongoose, { Schema, Document, Model } from "mongoose";
import type { EditLockSource } from "@/lib/month-lock";

export interface IMonth extends Document {
  year: number;
  month: number;
  label: string;
  isActive: boolean;
  editLocked: boolean;
  editLockSource: EditLockSource;
  createdAt: Date;
  updatedAt: Date;
}

const MonthSchema = new Schema<IMonth>(
  {
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    label: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    editLocked: { type: Boolean, default: false },
    editLockSource: {
      type: String,
      enum: ["none", "manual", "auto"],
      default: "none",
    },
  },
  { timestamps: true }
);

MonthSchema.index({ year: 1, month: 1 }, { unique: true });

if (mongoose.models.Month && !mongoose.models.Month.schema.path("editLocked")) {
  mongoose.deleteModel("Month");
}

const Month: Model<IMonth> =
  mongoose.models.Month || mongoose.model<IMonth>("Month", MonthSchema);

export default Month;
