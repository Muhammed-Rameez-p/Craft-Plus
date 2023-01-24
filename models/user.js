/* eslint-disable no-new-wrappers */
const mongoose = require('mongoose')
const products = require('./productModel')

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: Number,
    requied: true
  },
  password: {
    type: String,
    required: true
  },
  confirmPassword: {
    type: String,
    required: true

  },
  resetToken: String,
  resetTokenExpiration: Date,
  access: {
    type: Boolean,
    default: true
  },
  cart: {
    items: [{
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      qty: {
        type: Number
      }
    }
    ],
    totalPrice: Number
  }
})

userSchema.methods.addCart = function (pro) {
  const cart = this.cart
  const isExisting = cart.items.findIndex(objItems => {
    return new String(objItems.product_id).trim() === new String(pro._id).trim()
  })
  if (isExisting >= 0) {
    cart.items[isExisting].qty += 1
  } else {
    cart.items.push({ product_id: pro._id, qty: 1 })
  }
  if (!cart.totalPrice) {
    cart.totalPrice = 0
  }
  cart.totalPrice += pro.price
  return this.save()
}

userSchema.methods.count = function () {
  const cart = this.cart
  if (cart.items.length !== 0) {
    const count = cart.items.length
    return count
  } else {
    return 0
  }
}

userSchema.methods.changeQty = async function (productId, qty, count, cb) {
  const cart = this.cart
  console.log(qty)
  const quantity = parseInt(qty)
  const cnt = parseInt(count)
  console.log('%%%%%%' + quantity)
  const response = {}
  const product = await products.findOne({ _id: productId })
  if ((cnt === -1 && quantity === 1) || (cnt === -2)) {
    const Existing = cart.items.findIndex(objitems => {
      return new String(objitems.product_id).trim() === new String(productId).trim()
    })

    cart.items.splice(Existing, 1)
    cart.totalPrice -= product.price * qty
    response.remove = true
  } else if (cnt === 1) {
    console.log('hiii-plus')
    const Existing = cart.items.findIndex(objitems => {
      return new String(objitems.product_id).trim() === new String(productId).trim()
    })

    cart.items[Existing].qty += cnt
    console.log(cart.items[Existing].qty)
    cart.totalPrice += product.price
    response.status = cart.items[Existing].qty
  } else if (cnt === -1) {
    console.log('hiiiiiii-minus')
    const Existing = cart.items.findIndex(objitems => {
      return new String(objitems.product_id).trim() === new String(productId).trim()
    })

    cart.items[Existing].qty += cnt
    console.log(cart.items[Existing])
    cart.totalPrice -= product.price
    response.status = cart.items[Existing].qty
  }
  this.save().then((doc) => {
    response.total = doc.cart.totalPrice
    cb(response)
  })
}

const User = mongoose.model('User', userSchema)

module.exports = User
