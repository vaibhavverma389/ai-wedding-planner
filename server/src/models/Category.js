import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    imageUrl: {
      type: String,
      default: null
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
categorySchema.index({ parentId: 1 });
categorySchema.index({ order: 1 });
categorySchema.index({ isActive: 1 });

export const Category = mongoose.model('Category', categorySchema);
