const user = require('../models/user')
const bcrypt = require('bcrypt')
const Product = require('../models/productModel')

module.exports = {
  dologing: async (userlog) => {
    const userz = await user.findOne({ email: userlog.email }).lean()
    return new Promise((resolve, reject) => {
      const response = {}
      console.log(userlog.password, userz.password)
      if (userz && userz.access) {
        bcrypt.compare(userlog.password, userz.password).then((stat) => {
          if (stat) {
            response.user = userz
            response.status = true
            resolve(response)
            console.log('login success')
          } else {
            resolve({ status: false })
            console.log('password wrong')
          }
        })
      } else {
        resolve({ status: false })
        console.log('no user')
      }
    })
  },

  getAllClients: async () => {
    const users = await user.find()
    return new Promise((resolve, reject) => {
      if (users != null) {
        resolve(users)
      } else {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject({ status: 'failed', message: 'no users found' })
      }
    })
  },

  getAllProduct: async () => {
    const products = await Product.find({ }).populate('brand').populate('category').exec()
    return new Promise((resolve, reject) => {
      resolve(products)
    })
  }
}
