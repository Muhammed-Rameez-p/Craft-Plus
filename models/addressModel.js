
const mongoose = require('mongoose')
const Objectid = mongoose.Types.ObjectId

const addressSchema = new mongoose.Schema({

  userId: {
    type: Objectid,
    required: true,
    ref: 'User'
  },

  address: [{
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
  }]
})

addressSchema.methods.editAdd = async function (data, id) {
  const add = this.address
  // eslint-disable-next-line eqeqeq
  const Existing = await add.findIndex(obj => obj._id == id)
  add[Existing] = data
  return this.save()
}

const addressModel = mongoose.model('AddressData', addressSchema)

module.exports = addressModel
