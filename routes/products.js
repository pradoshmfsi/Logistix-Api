const e = require("express");
const Auth = require("../middlewares/Auth");
const express = require("express");
const fs = require("fs");
const { Product } = require("../models/Product");
const router = express.Router();

//LIST

router.get("/product", async (req, res) => {
  try {
    const products = await Product.find();
    if (products.length == 0) {
      return res.status(400).json({
        message: "No products found",
      });
    } else {
      return res.status(200).json({
        summary: {
          message: "Products retrieved successfully",
          totalcount: `${products.length}`,
        },
        products,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Sommething went wrong",
      error: err.message,
    });
  }
});

//ADD

router.post("/product", Auth, async (req, res) => {
  try {
    console.log("Reached the add route");
    let error = "";
    const { productName, productPrice, productDesc, productImage } = req.body;
    if (productName == "" && error == "") {
      error = "Missing product name";
      res.status(400).json({
        message: error,
      });
    }
    if (productPrice == "" && error == "") {
      error = "Missing product price";
      res.status(400).json({
        message: error,
      });
    }
    if (productDesc == "" && error == "") {
      error = "Missing product description";
      res.status(400).json({
        message: error,
      });
    }
    if (error == "") {
      const productObj = {
        productName,
        productPrice,
        productDesc,
        productImage,
      };
      const product = new Product(productObj);
      await product.save();
      return res.status(201).json({
        summary: {
          message: "Product saved successfully",
          totalcount: `${await Product.count()}`,
        },
        product,
      });
    }
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
});

router.put("/product/:id", Auth, async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    let error = "";
    const { productName, productPrice, productDesc, productImage } = req.body;
    if (product) {
      if (productName == "" && error == "") {
        error = "Missing product name";
        res.status(400).json({
          message: error,
        });
      }
      if (productPrice == "" && error == "") {
        error = "Missing product price";
        res.status(400).json({
          message: error,
        });
      }
      if (productDesc == "" && error == "") {
        error = "Missing product description";
        res.status(400).json({
          message: error,
        });
      }
      product.productName = productName;
      product.productPrice = productPrice;
      product.productDesc = productDesc;
      product.productImage = productImage;
      await product.save();
      return res.status(201).json({
        message: `Product with id ${id} updated successfully`,
      });
    } else {
      return res.status(400).json({
        message: "No such id found",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
});

router.delete("/product/:id", Auth, async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (product) {
      await Product.findByIdAndDelete(id);
      return res.status(200).json({
        message: "Product deleted successfully",
      });
    } else {
      return res.status(400).json({
        message: "No such id found",
      });
    }
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
});
module.exports = router;
