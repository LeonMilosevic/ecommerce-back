const Product = require("../models/product");
const cloudinary = require("cloudinary").v2;
const formidable = require("formidable");
const _ = require("lodash");
const { errorHandler } = require("../helpers/dbErrorHandler");

// CLOUDINARY CONFIG
cloudinary.config({
  cloud_name: "clothify",
  api_key: "955668639743797",
  api_secret: "QsQmsr_r0STUQhHTIMo9NEpl08o"
});
// END OF CLOUDINARY CONFIG

// PRODUCT ID
exports.productById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category subCategory")
    .exec((error, product) => {
      if (error || !product)
        return res.status(400).json({ error: "Product not found" });

      req.product = product;
      next();
    });
};
// END OF PRODUCT ID

// PRODUCT READ
exports.read = (req, res) => {
  return res.json(req.product);
};

// END OF PRODUCT READ

exports.create = (req, res) => {
  let form = new formidable.IncomingForm();
  form.multiples = true;
  form.keepExtensions = true;

  form.parse(req, (error, fields, files) => {
    if (error)
      return res.status(400).json({ error: "Image could not be uploaded" });

    // CHECK FOR ALL FIELDS
    const {
      name,
      about,
      price,
      category,
      quantity,
      color,
      size,
      brandDescription,
      instructions,
      brand,
      subCategory,
      selection,
      sold,
      editorsChoice,
      onSale
    } = fields;

    if (
      !name ||
      !about ||
      !price ||
      !category ||
      !quantity ||
      !color ||
      !size ||
      !brandDescription ||
      !instructions ||
      !brand ||
      !subCategory ||
      !selection ||
      !sold ||
      !editorsChoice ||
      !onSale
    )
      return res.status(400).json({ error: "all fields are required" });
    // FIELD CHECK ENDED

    // --FILL IN THE PRODUCT MODULE--
    let product = new Product(fields);
    // --FILLED THE PRODUCT MODULE--

    // ---PHOTOS UPLOAD TO CLOUDINARY ACCOUNT---
    if (files) {
      // --- FILE SIZE CHECK ---
      if (
        files.photo1.size > 1000000 ||
        files.photo2.size > 1000000 ||
        files.photo3.size > 1000000 ||
        files.photo4.size > 1000000
      )
        return res
          .status(400)
          .json({ error: "image should not be more than 1mb" });
      // --- FILE SIZE CHECK END ---

      // UPLOAD IMAGES
      let photoPaths = [];
      const photo1Path = files.photo1.path;
      const photo2Path = files.photo2.path;
      const photo3Path = files.photo3.path;
      const photo4Path = files.photo4.path;

      photoPaths.push(photo1Path, photo2Path, photo3Path, photo4Path);

      photoPaths.map(photo => {
        cloudinary.uploader.upload(
          photo,
          { folder: files.photo1.name },
          (error, result) => {
            if (error)
              return res.status(400).json({ error: "image upload error" });
            //@ts-ignore
            product.imageFolderName = files.photo1.name;
            //@ts-ignore
            product.photoUrl.push(result.secure_url);
            //@ts-ignore
            product.photoId.push(result.public_id);
            //@ts-ignore
            if (product.photoUrl.length == 4) {
              product.save((error, result) => {
                if (error)
                  return res.status(400).json({ error: errorHandler(error) });

                res.json(result);
              });
            }
          }
        );
      });

      // END OF UPLOAD IMAGES
    }
  });
};

// PRODUCT REMOVE

exports.remove = (req, res) => {
  const product = req.product;
  cloudinary.api.delete_resources_by_prefix(
    `${product.imageFolderName}/`,
    (error, result) => {
      if (error) return res.status(400).json({ error: errorHandler(error) });

      product.remove((error, success) => {
        if (error)
          return res
            .status(400)
            .json({ error: "error deleting the product from DB" });

        product.remove((error, success) => {
          if (error)
            return res.status(400).json({ error: errorHandler(error) });

          res.json({ msg: "Product deleted successfully" });
        });
      });
    }
  );
};
// END OF PRODUCT REMOVE

// PRODUCT UPDATE

exports.update = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (error, fields, files) => {
    if (error)
      return res.status(400).json({ error: "Image could not be uploaded" });

    // // CHECK FOR ALL FIELDS
    // const {
    //   name,
    //   about,
    //   price,
    //   category,
    //   quantity,
    //   color,
    //   size,
    //   brandDescription,
    //   instructions,
    //   brand
    // } = fields;

    // if (
    //   !name ||
    //   !about ||
    //   !price ||
    //   !category ||
    //   !quantity ||
    //   !color ||
    //   !size ||
    //   !brandDescription ||
    //   !instructions ||
    //   !brand
    // )
    // return res.status(400).json({ error: "all fields are required" });
    // FIELD CHECK ENDED

    // --UPDATE THE PRODUCT MODULE--
    let product = req.product;
    product = _.extend(product, fields);
    // --UPDATED THE PRODUCT MODULE--

    product.save((error, result) => {
      if (error)
        return res.status(400).json({ error: "product did not update" });

      res.json(result);
    });
  });
};

// query and sorting

exports.list = (req, res) => {
  let order = req.query.order ? req.query.order : "asc";
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

  Product.find()
    .populate("category subCategory selection")
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((error, products) => {
      if (error) return res.status(400).json({ error: "Products not found" });

      res.json(products);
    });
};

exports.listRelated = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

  Product.find({
    _id: { $ne: req.product },
    subCategory: req.product.subCategory
  })
    .limit(limit)
    .populate("subCategory")
    .exec((error, products) => {
      if (error) return res.status(400).json({ error: "Products not found" });

      res.json(products);
    });
};

exports.listBySearch = (req, res) => {
  let order = req.body.order ? req.body.order : "desc";
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = parseInt(req.body.skip);
  let findArgs = {};

  // console.log(order, sortBy, limit, skip, req.body.filters);
  // console.log("findArgs", findArgs);

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        // gte -  greater than price [0-10]
        // lte - less than
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1]
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  Product.find(findArgs)
    .populate("category subCategory selection ")
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found"
        });
      }
      res.json({
        size: data.length,
        data
      });
    });
};

exports.listSearch = (req, res) => {
  const query = {};
  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: "i" };
    Product.find(query)
      .populate("category subCategory")
      .exec((error, products) => {
        if (error)
          return res.status(400).json({
            error: errorHandler(error)
          });
        res.json(products);
      });
  }
};

exports.decreaseQuantity = (req, res, next) => {
  let bulkOps = req.body.order.products.map(item => {
    return {
      updateOne: {
        filter: { _id: item._id },
        update: { $inc: { quantity: -item.count, sold: +item.count } }
      }
    };
  });

  Product.bulkWrite(bulkOps, {}, (error, products) => {
    if (error)
      return res.status(400).json({ error: "Could not update product" });

    next();
  });
};
