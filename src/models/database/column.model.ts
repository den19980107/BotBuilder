import mongoose, { Schema, Document } from 'mongoose';

export enum ColumnDataType {
    string = "string",
    boolean = "boolean",
    number = "number",
    null = "null"
}

export interface InsertOrUpdateColumnDto {
    name: string,
    displayName: string,
    dataType: ColumnDataType,
    require: boolean,
    belongTableId: string
}

export interface IColumn extends Document {
    name: string,
    displayName: string,
    dataType: ColumnDataType,
    require: boolean,
    belongTableId: string,
}

const ColumnSchema: Schema = new Schema({
    name: { type: String, required: true },
    displayName: { type: String, required: true },
    dataType: { type: String, required: true },
    require: { type: Boolean, required: true },
    belongTableId: { type: String, required: true }
});

// Export the model and return your IUser interface
export default mongoose.model<IColumn>('Column', ColumnSchema);