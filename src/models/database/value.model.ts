import mongoose, { Schema, Document } from 'mongoose';

export interface IValue extends Document {
    data: any,
    belongRowId: string,
    belongColumnId: string
}

const ValueSchema: Schema = new Schema({
    data: { type: Schema.Types.Mixed },
    belongRowId: { type: String, required: true },
    belongColumnId: { type: String, required: true }
});

// Export the model and return your IUser interface
export default mongoose.model<IValue>('Value', ValueSchema);