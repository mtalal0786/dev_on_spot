import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  role: {
    type: String,
    enum: ['Admin', 'Editor', 'Viewer'],
    default: 'Viewer',
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
export default User;