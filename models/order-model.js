const mongoose = require('mongoose')
const Objectid = mongoose.Types.ObjectId

const orderSchema = new mongoose.Schema({

  userId: {
    type: Objectid,
    required: true,
    ref: 'User'
  },
  productIds: [{
    product_id:
        {
          type: Objectid,
          ref: 'Product',
          required: true
        },
    qty: {
      required: true,
      type: Number

    },
    status: {
      type: String,
      default: 'Order Confirmed'
    },

    totalPrice:
        { type: Number }
  }],

  address: {
    fullName: {
      type: String,
      required: true
    },
    phone: {
      type: Number,
      required: true
    },
    houseName: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    }
  },

  grandTotal: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  payment: {
    type: String,
    default: 'unpaid'
  },
  orderstat: {
    type: String,
    enum: ['CONFIRMED', 'SHIPPED', 'OUT FOR DELIVERY', 'DELIVERED', 'CANCELLED'],
    default: 'CONFIRMED'
  }
},
{
  timestamps: true
}
)

const orderModel = mongoose.model('Orders', orderSchema)

module.exports = orderModel
