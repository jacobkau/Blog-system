import User from '../models/User.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';
import crypto from 'crypto';
import Post from '../models/Post.js'; 

// @desc    Generate password reset token
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // Same generic message prevents email enumeration
  const GENERIC = {
    success: true,
    message: 'If that email is registered, a reset link has been sent.',
  };

  if (!email) {
    return next(new ErrorResponse('Please provide an email', 400));
  }

  const user = await User.findOne({ email });

  // Even if user not found, respond with same message
  if (!user) {
    return res.json(GENERIC);
  }

  // Generate raw + hashed token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetLink = `${clientUrl}/reset-password/${rawToken}`;

  // Return the token + user info so the frontend can send via EmailJS
  res.status(200).json({
    success: true,
    message: 'Reset link generated',
    data: {
      to_name: user.name,
      to_email: user.email,
      reset_link: resetLink,
    },
  });
});

// @desc    Reset password with token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return next(
      new ErrorResponse('Password must be at least 6 characters', 400)
    );
  }

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    return next(new ErrorResponse('Invalid or expired reset token', 400));
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful. You can now log in.',
  });
});





// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return next(
      new ErrorResponse('Please provide name, email and password', 400)
    );
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(
      new ErrorResponse('User already exists with this email', 400)
    );
  }

  const user = await User.create({ name, email, password });
  sendTokenResponse(user, 201, res);
});


// @desc    Delete current user's account
// @route   DELETE /api/auth/account
// @access  Private
export const deleteAccount = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Prevent the last admin from deleting themselves
  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      return next(
        new ErrorResponse('Cannot delete the last admin account', 400)
      );
    }
  }

  //  Cascade delete — remove all posts authored by this user first
  await Post.deleteMany({ author: user._id });

  // Then delete the user
  await user.deleteOne();

  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully',
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Validate input
  if (!email || !password) {
    return next(
      new ErrorResponse('Please provide email and password', 400)
    );
  }

  // 2. Find user and explicitly include password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // 3. Compare passwords
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // 4. Send token
  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    bio: req.body.bio,
    location: req.body.location,
    website: req.body.website,
  };

  Object.keys(fieldsToUpdate).forEach(
    (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  }).select('-password');

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Helper to send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const cookieExpireDays = Number(process.env.JWT_COOKIE_EXPIRE) || 30;

  const options = {
    expires: new Date(
      Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
};
