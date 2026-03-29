import mongoose, { Schema, Document } from 'mongoose';

export interface IGame extends Document {
    name: string; // "Pick 3", "Powerball"
    slug: string; // "pick-3"
    stateSlug: string; // "az"
    sourceUrl: string; // "/results/az/pick3"
    lastDrawDate: Date;
    nextDrawDate: Date;
    jackpot: string;
    numbers: string[]; // ["1", "2", "3"]
    bonusBall: string;
    powerBall: string;
    historyAvailable: boolean;
    imageUrl?: string;
}

const GameSchema: Schema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    stateSlug: { type: String, required: true, index: true },
    sourceUrl: { type: String, required: true },
    historyUrl: { type: String }, // New field for deep scraping
    lastDrawDate: { type: Date },
    nextDrawDate: { type: Date },
    jackpot: { type: String },
    numbers: { type: [String], default: [] },
    bonusBall: { type: String },
    powerBall: { type: String },
    historyAvailable: { type: Boolean, default: false },
    imageUrl: { type: String },
}, { timestamps: true });

// Composite index to ensure unique games per state
GameSchema.index({ stateSlug: 1, slug: 1 }, { unique: true });

export default mongoose.models.Game || mongoose.model<IGame>('Game', GameSchema);
