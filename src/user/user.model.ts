import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  password: { type: String },
});

export interface User extends mongoose.Document {
  name: string;
  email: string;
  password: string;
}
