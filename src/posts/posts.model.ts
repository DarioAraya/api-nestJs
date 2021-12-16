import * as mongoose from 'mongoose';

export const PostSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  username: { type: String, required: true },
  title: { type: String },
  comment: { type: String },
  date: { type: Date, required: true },
  _tags: { type: [] },
});

export interface Post extends mongoose.Document {
  _id: string;
  username: string;
  title: string;
  comment: string;
  date: Date;
  _tags: [];
}
