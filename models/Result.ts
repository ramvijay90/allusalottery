import mongoose from 'mongoose';

const ResultSchema = new mongoose.Schema({
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true, index: true },
    date: { type: Date, required: true, index: true },
    numbers: { type: [String], required: true },
    jackpot: { type: String },
    powerBall: { type: String },
}, { timestamps: true });

// Compound index to prevent duplicate entries for the same game on the same date
ResultSchema.index({ gameId: 1, date: 1 }, { unique: true });

const Result = mongoose.models.Result || mongoose.model('Result', ResultSchema);

export default Result;
