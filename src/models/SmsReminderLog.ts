import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISmsReminderLog extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  phone: string;
  targetDate: string;
  missingMeals: string[];
  message: string;
  status: "sent" | "test" | "failed" | "skipped";
  providerResponse?: string;
  createdAt: Date;
}

const SmsReminderLogSchema = new Schema<ISmsReminderLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    phone: { type: String, default: "" },
    targetDate: { type: String, required: true },
    missingMeals: [{ type: String }],
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["sent", "test", "failed", "skipped"],
      required: true,
    },
    providerResponse: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

SmsReminderLogSchema.index({ createdAt: -1 });

const SmsReminderLog: Model<ISmsReminderLog> =
  mongoose.models.SmsReminderLog ||
  mongoose.model<ISmsReminderLog>("SmsReminderLog", SmsReminderLogSchema);

export default SmsReminderLog;
