import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot be more than 50 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters'],
    default: ""
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true, // This automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Cascade delete posts when a category is deleted
CategorySchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  console.log(`Posts being removed from category ${this._id}`);
  await this.model('Post').deleteMany({ category: this._id });
  next();
});

// Reverse populate with virtuals
CategorySchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'category',
  justOne: false
});

const Category = mongoose.model('Category', CategorySchema);
export default Category;
