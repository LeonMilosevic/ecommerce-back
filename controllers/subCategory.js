const SubCategory = require("../models/subCategory");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.subCategoryById = (req, res, next, id) => {
  SubCategory.findById(id).exec((error, subCategory) => {
    if (error || !subCategory)
      return res.status(400).json({ error: "Sub category does not exist" });

    req.subCategory = subCategory;
    next();
  });
};

exports.list = (req, res) => {
  SubCategory.find().exec((error, data) => {
    if (error) return res.status(400).json({ error: errorHandler(error) });

    res.json(data);
  });
};

exports.read = (req, res) => {
  return res.json(req.subCategory);
};

exports.create = (req, res) => {
  const subCategory = new SubCategory(req.body);
  subCategory.save((error, data) => {
    if (error) return res.status(400).json({ error: errorHandler(error) });

    res.json({ data });
  });
};

exports.update = (req, res) => {
  const subCategory = req.subCategory;
  subCategory.name = req.body.name;
  subCategory.save((error, data) => {
    if (error) return res.status(400).json({ error: errorHandler(error) });

    res.json(data);
  });
};

exports.remove = (req, res) => {
  const subCategory = req.subCategory;
  subCategory.remove((error, data) => {
    if (error) return res.status(400).json({ error: errorHandler(error) });

    res.json({ msg: "Sub Category deleted" });
  });
};
