import mongoose, { Schema, Document } from 'mongoose';

export interface InsertOrUpdateRowDto {
    belongTableId: string
}

export interface IRow extends Document {
    belongTableId: string,
}

const RowSchema: Schema = new Schema({
    belongTableId: { type: String, required: true }
});

// Export the model and return your IUser interface
export default mongoose.model<IRow>('Row', RowSchema);