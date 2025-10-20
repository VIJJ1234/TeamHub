
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    age:{
      type: Number,
      min: 0,
      max: 120,
    },
    gender:{
      type: String,
      enum: ['Male','Female', 'Other'],
    },
    role:{
      type: String,
    },
    roleDescription:{
      type: String,
    },
    location:{
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
      default: 'https://cdn.vectorstock.com/i/1000v/92/16/default-profile-picture-avatar-user-icon-vector-46389216.jpg', // Default profile picture
    },
    experience:{
      type:Number,
      default:0
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const User = mongoose.model('User', userSchema);

export default User;
