const mongoose = require('mongoose')

const adminDetailsSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'email field required']
  },
  password: {
    type: String,
    required: [true, 'password field required']
  }
})

const Admin = mongoose.model('Admin', adminDetailsSchema)

module.exports = Admin
