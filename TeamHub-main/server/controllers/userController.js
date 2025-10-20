import User from '../models/userModel.js';
import { createJWTTOkenUser } from '../utiles/createJWTToken.js';
import path from 'path';

const userRegistration = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password,
    });

    await newUser.save();

    // Remove password before sending response
    const userResponse = newUser.toObject();
    delete userResponse.password;
    const userToken = createJWTTOkenUser(newUser._id);

    res.status(201).cookie("user",userToken).json({ 
      message: 'User registered successfully', 
      user: userResponse 
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const userSignIn = async(req,res)=>{
  try {
    const {email,password} = req.body;
    // Find user by email
    const user = await User.findOne({email:email})

    if(!user)
      return res.status(400).json({message:"User not found"});
    // Check password
    
    if(user.password !== password)  
      return res.status(400).json({message:"Invalid password"});  
    // Create JWT token
    user.password = undefined
    const userToken = createJWTTOkenUser(user._id);
    res.status(200).cookie("user",userToken).json({ 
      message: 'User signed in successfully', 
      user 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
const getProfileOfUser = (req, res) => {
  try {   
    const user = req.user; // User info is attached by AuthenticationMiddleware
    res.status(200).json({ 
      message: 'User profile retrieved successfully', 
      user 
    });
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

const updateUserProfile = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'No update data provided' });
    }

    const userId = req.user._id;
    const { username, email, age, gender, role, roleDescription, location, experience } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // ✅ Check unique username if changed
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      user.username = username;
    }

    // ✅ Update only provided fields
    if (email) user.email = email;
    if (age) user.age = age;
    if (role) user.role = role;
    if (roleDescription) user.roleDescription = roleDescription;
    if (location) user.location = location;
    if (gender) user.gender = gender;
    if (experience) user.experience = experience;

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(200).json({
      message: 'User profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    // Update password
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: 'Password updated successfully' });
  }
  catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const filePath = `/uploads/${req.file.filename}`;
    user.profilePicture = filePath;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({ message: 'Profile picture updated', user: userResponse });
  } catch (error) {
    console.error('Upload avatar error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { 
  userRegistration,
  userSignIn,
  getProfileOfUser,
  updateUserProfile,
  forgetPassword,
};

// New: handle avatar upload


