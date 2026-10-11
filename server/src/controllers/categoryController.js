import { Category } from '../models/Category.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getCategories = async (req, res, next) => {
  try {
    const { includeInactive } = req.query;
    const filter = includeInactive === 'true' ? {} : { isActive: true };

    const allCategories = await Category.find(filter).sort({ order: 1, name: 1 }).lean();

    // Organize into hierarchical tree: top-level parents with their children
    const parentCategories = allCategories.filter((cat) => !cat.parentId);
    const categoryTree = parentCategories.map((parent) => {
      const subcategories = allCategories.filter(
        (cat) => cat.parentId && cat.parentId.toString() === parent._id.toString()
      );
      return {
        ...parent,
        subcategories
      };
    });

    return sendSuccess(res, categoryTree, 'Categories retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug, isActive: true }).lean();

    if (!category) {
      return sendError(res, 'Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    const subcategories = await Category.find({ parentId: category._id, isActive: true }).lean();

    return sendSuccess(
      res,
      {
        ...category,
        subcategories
      },
      'Category details retrieved'
    );
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, parentId, icon, imageUrl, order } = req.body;

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const existing = await Category.findOne({ slug });
    if (existing) {
      return sendError(res, 'Category with this name or slug already exists', 409, 'CATEGORY_EXISTS');
    }

    const category = await Category.create({
      name,
      slug,
      description,
      parentId: parentId || null,
      icon,
      imageUrl,
      order: order || 0
    });

    return sendSuccess(res, category, 'Category created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.name) {
      updateData.slug = updateData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    const category = await Category.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!category) {
      return sendError(res, 'Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    return sendSuccess(res, category, 'Category updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return sendError(res, 'Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    // Soft delete
    category.isActive = false;
    await category.save();

    return sendSuccess(res, null, 'Category deactivated successfully');
  } catch (err) {
    next(err);
  }
};
