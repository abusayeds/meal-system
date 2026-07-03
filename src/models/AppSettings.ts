import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAppSettings extends Document {
  lockAllMemberEdits: boolean;
  mealReminderEnabled: boolean;
  smsLiveMode: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AppSettingsSchema = new Schema<IAppSettings>(
  {
    lockAllMemberEdits: { type: Boolean, default: false },
    mealReminderEnabled: { type: Boolean, default: true },
    smsLiveMode: { type: Boolean, default: true },
  },
  { timestamps: true }
);

if (mongoose.models.AppSettings) {
  const schema = mongoose.models.AppSettings.schema;
  if (!schema.path("mealReminderEnabled") || !schema.path("smsLiveMode")) {
    mongoose.deleteModel("AppSettings");
  }
}

const AppSettings: Model<IAppSettings> =
  mongoose.models.AppSettings ||
  mongoose.model<IAppSettings>("AppSettings", AppSettingsSchema);

export default AppSettings;
