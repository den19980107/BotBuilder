import mongoose, { Schema, Document } from 'mongoose';

export interface IBot extends Document {
    belongUserId: string,
    name: string,
    script: string
}

const BotSchema: Schema = new Schema({
    belongUserId: { type: String, required: true },
    name: { type: String, required: true },
    script: { type: String, required: true }
});

// Export the model and return your IUser interface
export default mongoose.model<IBot>('Bot', BotSchema);