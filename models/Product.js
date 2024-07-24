const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const productSchema = new Schema({
    productName:{
        type:String,
        required:true
    },
    productPrice:{
        type:String,
        required:true
    },
    productDesc:{
        type:String,
        required:false
    },
    productImage:{
        type:String,
        required:false
    }
},{timestamps:true})

exports.Product = mongoose.model('product',productSchema);