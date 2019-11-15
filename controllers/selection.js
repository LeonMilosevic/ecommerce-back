const Selection = require("../models/selection");
const { errorHandler } = require("../helpers/dbErrorHandler");

const cloudinary = require("cloudinary").v2;
const formidable = require("formidable");

// CLOUDINARY CONFIG
cloudinary.config({
  cloud_name: "clothify",
  api_key: "955668639743797",
  api_secret: "QsQmsr_r0STUQhHTIMo9NEpl08o"
});
// END OF CLOUDINARY CONFIG

exports.selectionById = (req, res, next, id) => {
  Selection.findById(id).exec((error, selection) => {
    if (error || !selection)
      return res.status(400).json({ error: "Selection does not exist" });

    req.selection = selection;
    next();
  });
};

exports.list = (req, res) => {
  Selection.find().exec((error, data) => {
    if (error) return res.status(400).json({ error: errorHandler(error) });

    res.json(data);
  });
};

exports.read = (req, res) => {
  return res.json(req.selection);
};

exports.create = (req, res) => {
  let form = new formidable.IncomingForm();
  form.multiples = true;
  form.keepExtensions = true;

  form.parse(req, (error, fields, files) => {
    if (error)
      return res.status(400).json({ error: "Image could not be uploaded" });

    // --FILL IN THE selection MODULE--
    let selection = new Selection(fields);
    // --FILLED THE selection MODULE--

    // ---PHOTOS UPLOAD TO CLOUDINARY ACCOUNT---
    if (files) {
      // --- FILE SIZE CHECK ---
      if (files.photo.size > 1000000)
        return res
          .status(400)
          .json({ error: "image should not be more than 1mb" });
      // --- FILE SIZE CHECK END ---

      // UPLOAD IMAGE
      const photoPath = files.photo.path;

      cloudinary.uploader.upload(
        photoPath,
        { folder: files.photo.name },
        (error, result) => {
          if (error)
            return res.status(400).json({ error: "image upload error" });

          selection.photoUrl = result.secure_url;

          selection.save((error, result) => {
            if (error)
              return res.status(400).json({ error: errorHandler(error) });

            res.json(result);
          });
        }
      );
    }

    // END OF UPLOAD IMAGES
  });
};

exports.update = (req, res) => {
  const selection = req.selection;
  selection.name = req.body.name;
  selection.save((error, data) => {
    if (error) return res.status(400).json({ error: errorHandler(error) });

    res.json(data);
  });
};

exports.remove = (req, res) => {
  const selection = req.selection;
  selection.remove((error, data) => {
    if (error) return res.status(400).json({ error: errorHandler(error) });

    res.json({ msg: "selection deleted" });
  });
};
