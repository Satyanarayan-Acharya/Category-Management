const Category = require("../models/Category");

const createCategory = async (req, res) => {
  const { name, parent } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required." });
  }

  const category = await Category.create({ name, parent: parent || null });
  res.status(201).json({
    success: true,
    message: "Category created successfully.",
    category,
  });
};

const getCategories = async (req, res) => {
  const categories = await Category.find().lean();

  const buildTree = (parentId) =>
    categories
      .filter((c) =>
        c.parent ? c.parent.toString() === parentId : parentId === null
      )
      .map((c) => ({ ...c, children: buildTree(c._id.toString()) }));

  res.status(200).json({
    success: true,
    message: "Categories retrieved successfully.",
    categories: buildTree(null),
  });
};

const updateCategory = async (req, res) => {
  const { name, status } = req.body;
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found.",
    });
  }

  category.name = name || category.name;
  category.status = status !== undefined ? status : category.status;

  if (status === false) {
    await Category.updateMany({ parent: category._id }, { status: false });
  }

  await category.save();
  res.status(200).json({
    success: true,
    message: "Category updated successfully.",
    category,
  });
};

const deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found.",
    });
  }

  await Category.updateMany(
    { parent: category._id },
    { parent: category.parent }
  );
  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: "Category deleted successfully.",
  });
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
