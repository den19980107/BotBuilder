import mongoose, { Schema, Document } from 'mongoose';

export interface InsertOrUpdateTableDto {
    name: string,
    belongUserId: string
}

export interface ITable extends Document {
    name: string,
    belongUserId: string,
}

const TableSchema: Schema = new Schema({
    name: { type: String, required: true },
    belongUserId: { type: String, required: true }
});

// Export the model and return your IUser interface
export default mongoose.model<ITable>('Table', TableSchema);