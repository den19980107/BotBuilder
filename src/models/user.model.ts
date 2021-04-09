import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string,
    password: string
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
});

// Export the model and return your IUser interface
export default mongoose.model<IUser>('User', UserSchema);