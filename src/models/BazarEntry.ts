import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IBazarEntry extends Document {
  userId: Types.ObjectId;
  monthId: Types.ObjectId;
  date: string;
  amount: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const BazarEntrySchema = new Schema<IBazarEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    monthId: { type: Schema.Types.ObjectId, ref: "Month", required: true },
    date: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

BazarEntrySchema.index({ userId: 1, monthId: 1, date: 1 });

const BazarEntry: Model<IBazarEntry> =
  mongoose.models.BazarEntry ||
  mongoose.model<IBazarEntry>("BazarEntry", BazarEntrySchema);

export default BazarEntry;
