import mongoose, { Schema, Document } from 'mongoose';

export interface IScript extends Document {
    belongUserId: string,
    name: string,
    nodes: string,
    isMoudle: boolean
}

const ScriptSchema: Schema = new Schema({
    belongUserId: { type: String, required: true },
    name: { type: String, required: true },
    nodes: { type: String, require: true },
    isMoudle: { type: Boolean, require: true }
});

// Export the model and return your IUser interface
export default mongoose.model<IScript>('Script', ScriptSchema);
