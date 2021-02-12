import mongoose, { Schema, Document } from 'mongoose';

export interface IBot extends Document {
    id: string,
    belongUserId: string,
    name: string,
    script: string
}

const BotSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    belongUserId: { type: String, required: true },
    name: { type: String, required: true },
    script: { type: String, required: true }
});

// Export the model and return your IUser interface
export default mongoose.model<IBot>('Bot', BotSchema);