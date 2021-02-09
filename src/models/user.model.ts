import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    id: string,
    username: string,
    password: string
}

const UserSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    password: { type: String, required: true }
});

// Export the model and return your IUser interface
export default mongoose.model<IUser>('User', UserSchema);