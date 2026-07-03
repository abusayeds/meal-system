import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IMealEntry extends Document {
  userId: Types.ObjectId;
  monthId: Types.ObjectId;
  date: string;
  breakfast: number;
  lunch: number;
  dinner: number;
  breakfastSet: boolean;
  lunchSet: boolean;
  dinnerSet: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MealEntrySchema = new Schema<IMealEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    monthId: { type: Schema.Types.ObjectId, ref: "Month", required: true },
    date: { type: String, required: true },
    breakfast: { type: Number, default: 0, min: 0 },
    lunch: { type: Number, default: 0, min: 0 },
    dinner: { type: Number, default: 0, min: 0 },
    breakfastSet: { type: Boolean, default: false },
    lunchSet: { type: Boolean, default: false },
    dinnerSet: { type: Boolean, default: false },
  },
  { timestamps: true }
);

if (mongoose.models.MealEntry) {
  const schema = mongoose.models.MealEntry.schema;
  if (!schema.path("breakfastSet")) {
    mongoose.deleteModel("MealEntry");
  }
}

MealEntrySchema.index({ userId: 1, monthId: 1, date: 1 }, { unique: true });

const MealEntry: Model<IMealEntry> =
  mongoose.models.MealEntry ||
  mongoose.model<IMealEntry>("MealEntry", MealEntrySchema);

export default MealEntry;
