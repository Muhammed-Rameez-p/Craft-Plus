
const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A category must have a title'],
    unique: true
  },
  access: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    required: true,
    default: 'user_icon.jpg'
  }
}, {
  timestamps: true
})
const Category = mongoose.model('Category', categorySchema)

module.exports = Category
