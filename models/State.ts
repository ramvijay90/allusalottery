import mongoose, { Schema, Document } from 'mongoose';

export interface IState extends Document {
    name: string;
    slug: string; // e.g., "az", "ny"
    url: string;  // e.g., "/results/az"
    country: string; // "US", "Canada", "Europe"
    isActive: boolean;
    lastScraped: Date;
}

const StateSchema: Schema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    country: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    lastScraped: { type: Date },
}, { timestamps: true });

export default mongoose.models.State || mongoose.model<IState>('State', StateSchema);
