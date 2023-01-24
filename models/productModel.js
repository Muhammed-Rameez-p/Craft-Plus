const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A product must have a title']
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'please specify product category']
  },
  price: {
    type: Number,
    required: [true, 'A product must have a price']
  },
  description: {
    type: String,
    required: [true, 'Product must have a desciption']
  },
  images: {
    type: Array,
    required: [true, 'add atleast 1 image']
  },
  thumbnail: {
    type: String,
    required: [true, 'a producct must have a thumbnail']
  },
  stock: {
    type: Number
  },
  access: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})
const Product = mongoose.model('Product', productSchema)

module.exports = Product
