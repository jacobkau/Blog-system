import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters'],
  },
  avatar: {
  type: String,
  default: '',
},
bio: {
  type: String,
  maxlength: [250, 'Bio cannot exceed 250 characters'],
  default: '',
},
location: {
  type: String,
  maxlength: [100, 'Location cannot exceed 100 characters'],
  default: '',
},
website: {
  type: String,
  default: '',
},
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
passwordResetToken: {
  type: String,
  select: false,
},
passwordResetExpires: {
  type: Date,
  select: false,
},
passwordChangedAt: {
  type: Date,
  select: false,
},
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d', 
  });
};

// Match entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) {
    throw new Error(
      'Password not selected on user query. Did you forget .select("+password")?'
    );
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);
export default User;
