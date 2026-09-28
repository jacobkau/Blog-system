import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Category name cannot be more than 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Category must have an owner'],
    },
    postCount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Cascade-delete posts when a category is removed (optional but recommended)
CategorySchema.pre('findOneAndDelete', async function (next) {
  const categoryId = this.getQuery()._id;
  await mongoose.model('Post').deleteMany({ category: categoryId });
  next();
});

const Category = mongoose.model('Category', CategorySchema);
export default Category;
