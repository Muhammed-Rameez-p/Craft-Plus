const mongoose = require('mongoose')

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  productItems: [{
    type: mongoose.Types.ObjectId,
    ref: 'Product'
  }]

})
wishlistSchema.methods.addToWishlist = function (products, callback) {
  const productItems = this.productItems
  const response = {}
  const isExisting = productItems.findIndex(objinItems => objinItems === products)
  console.log(isExisting)
  if (isExisting >= 0) {
    console.log('Keerry')
    response.status = false
  } else {
    console.log('Ithil keeery')
    response.status = true
    productItems.push(products)
  }
  return this.save().then(() => callback(response))
}

const WishList = mongoose.model('WishList', wishlistSchema)

module.exports = WishList
