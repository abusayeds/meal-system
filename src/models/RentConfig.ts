import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IRentField {
  name: string;
  amount: number;
}

export interface IRentConfig extends Document {
  monthId: Types.ObjectId;
  fields: IRentField[];
  createdAt: Date;
  updatedAt: Date;
}

const RentFieldSchema = new Schema<IRentField>(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const RentConfigSchema = new Schema<IRentConfig>(
  {
    monthId: { type: Schema.Types.ObjectId, ref: "Month", required: true, unique: true },
    fields: { type: [RentFieldSchema], default: [] },
  },
  { timestamps: true }
);

const RentConfig: Model<IRentConfig> =
  mongoose.models.RentConfig ||
  mongoose.model<IRentConfig>("RentConfig", RentConfigSchema);

export default RentConfig;
