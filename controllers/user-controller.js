const User = require('../models/user')
const Category = require('../models/category-model')
const Product = require('../models/product-model')
const AddressModel = require('../models/address-model')
const Wishlist = require('../models/wishlist-model')
const OrderModel = require('../models/order-model')
const Banner = require('../models/banner-model')
const Coupons = require('../models/coupon')
const Razorpay = require('razorpay')
const bcrypt = require('bcrypt')
const { dologing } = require('./user-data')
const { sendotp, verifyotp } = require('../util/otp')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const hostEnv = process.env.HOST
const userEnv = process.env.USER
const passEnv = process.env.PASS
const keyIdEnv = process.env.KEY_ID
const keySecretEnv = process.env.KEY_SECRET

const mailer = nodemailer.createTransport({
  host: hostEnv,
  port: 587,
  auth: {
    user: userEnv,
    pass: passEnv
  }
})

module.exports = {

  singup: (req, res) => {
    if (req.session.loggedIn) {
      res.redirect('/')
    } else {
      res.render('user/signup')
    }
  },

  getLoging: (req, res, next) => {
    if (req.session.loggedIn) {
      res.redirect('/')
    } else {
      res.render('user/log')
    }
  },

  getHome: (req, res, next) => {
    res.redirect('/')
  },

  getContact: (req, res, next) => {
    res.render('user/contact')
  },

  getUserLogout: (req, res) => {
    req.session.user = null
    req.session.loggedIn = null
    res.redirect('/')
  },

  postlogin: (req, res) => {
    dologing(req.body).then((response) => {
      if (response.status) {
        req.session.loggedIn = true
        req.session.user = response.user
        res.redirect('/')
      } else {
        req.session.loggederror = true
        res.redirect('/log')
      }
    })
  },

  postsingupview: async (req, res) => {
    const email = req.body.email
    const phone = req.body.phone
    req.session.no = phone
    req.session.singup = req.body
    console.log(req.session.singup)
    const users = await User.findOne({ email })
    if (users) {
      console.log('exist')
      res.redirect('/')
    } else {
      sendotp(phone)
      res.render('user/otp')
    }
  },

  getotp: (req, res) => {
    let phone = null
    phone = req.session.no
    sendotp(phone)
    res.render('user/otp')
  },

  postResendOtp: async (req, res) => {
    let phone = null
    phone = req.session.no
    sendotp(phone)
    res.redirect('/getotp')
  },

  postotp: async (req, res) => {
    try {
      let { name, email, phone, password, confirmPassword } = req.session.singup
      const otp = req.body.otpis
      const emails = {
        to: email,
        from: 'rameezp2011@gmail.com',
        subject: 'sigin notification',
        text: 'We Welcomes you to shop',
        html: '<b>We Welcomes you to shop</b>'
      }
      await verifyotp(phone, otp).then(async (verificationCheck) => {
        if (verificationCheck.status === 'approved') {
          console.log(password, confirmPassword)
          password = await bcrypt.hash(password, 10)
          confirmPassword = await bcrypt.hash(confirmPassword, 10)
          console.log('otp success')
          const newPerson = new User({
            email,
            phone,
            name,
            password,
            confirmPassword
          })
          newPerson.save(function (err, Person) {
            if (err) {
              console.log(err)
              res.redirect('/signup')
            } else {
              console.log(Person)
              res.redirect('/')
              mailer.sendMail(emails)
            }
          })
        }
      })
    } catch (error) {
      console.log(error)
    }
  },

  getUserHome: async (req, res) => {
    try {
      const msg = req.flash('success')
      let count = null
      const user = req.session.user
      if (user) {
        const useer = await User.findById(user._id)
        count = useer.count()
      }
      const type = await Category.find()
      const products = await Product.find()
      const banner = await Banner.find()
      res.render('user/home', { msg, user, type, products, count, banner })
    } catch (err) {
      console.log(err)
    }
  },

  categorypage: async (req, res) => {
    const count = null
    const user = req.session.user
    const page = parseInt(req.query.page) || 1
    const itemsPerPage = 9
    const totalproducts = await Product.find().countDocuments()
    const type = await Category.find()
    const product = await Product.find().skip((page - 1) * itemsPerPage).limit(itemsPerPage)
    if (user) {
      const wishlistProducts = await Wishlist.findOne({ _id: user.wishlistId }).select({
        'products.product': 1,
        _id: 0
      })
      res.render('user/category2000', {
        login: true,
        user,
        product,
        type,
        count,
        wishlistProducts,
        page,
        hasNextPage: itemsPerPage * page < totalproducts,
        hasPreviousPage: page > 1,
        PreviousPage: page - 1
      })
    } else {
      res.render('user/category2000', {
        login: true,
        user,
        product,
        type,
        count,
        page,
        hasNextPage: itemsPerPage * page < totalproducts,
        hasPreviousPage: page > 1,
        PreviousPage: page - 1
      })
    }
  },

  categorylisting: async (req, res) => {
    const count = null
    const id = req.query.id
    const page = parseInt(req.query.page) || 1
    const itemsPerPage = 9
    const totalproducts = await Product.find().countDocuments()
    const product = await Product.find({ category: id }).populate('category', 'title').lean().skip((page - 1) * itemsPerPage).limit(itemsPerPage)
    const userId = req.session.id
    const type = await Category.find()
    res.render('user/category2000', {
      login: true,
      user: req.session.user,
      product,
      userId,
      type,
      count,
      page,
      hasNextPage: itemsPerPage * page < totalproducts,
      hasPreviousPage: page > 1,
      PreviousPage: page - 1
    })
  },

  productpage: async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const itemsPerPage = 9
    const totalproducts = await Product.find().countDocuments()
    const product = await Product.find({}).populate('category', 'title').lean().skip((page - 1) * itemsPerPage).limit(itemsPerPage)
    const userId = req.session.id
    const type = await Category.find()
    res.render('user/productpage', {
      login: true,
      user: req.session.user,
      product,
      userId,
      type,
      page,
      hasNextPage: itemsPerPage * page < totalproducts,
      hasPreviousPage: page > 1,
      PreviousPage: page - 1
    })
  },

  getReset: (req, res) => {
    res.render('user/reset')
  },

  getsingleProduct: async (req, res) => {
    const user = req.session.user
    const count = null
    const viewId = req.query.id
    const viewproduct = await Product.findById(viewId).populate('category')
    res.render('user/single-product', { viewproduct, count, user })
  },

  postReset: (req, res) => {
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        return res.redirect('/reset')
      }
      const token = buffer.toString('hex')
      User.findOne({ email: req.body.email }).then(users => {
        if (!users) {
          return res.redirect('/reset')
        }
        users.resetToken = token
        users.resetTokenExpiration = Date.now() + 3600000
        return users.save()
      })

        .then(result => {
          res.redirect('/')
          const emails = {
            to: [result.email],
            from: 'rameezp2011@gmail.com',
            subject: 'password reseted',
            html: `
               <p>You Requested  a Password reset </p>
                <p>Click this <a href="http://localhost:7000/resets?token=${token}">link</a> to set a passwor</p>
        `
          }
          mailer.sendMail(emails, function (err, res) {
            if (err) {
              console.log(err)
            } else {
              console.log(res.response +
               'email sended')
            }
          })
        }).catch(err => {
          console.log(err)
        })
    })
  },

  getNewPassword: (req, res) => {
    const token = req.query.token
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } }).then(users => {
      res.render('user/new-password', { userid: users._id, passwordToken: token })
    }).catch(err => {
      console.log(err)
    })
  },

  postResetPassword: (req, res) => {
    let updatedUser
    const newpassword = req.body.password
    const userId = req.body.userid
    const passwordToken = req.body.passwordToken
    User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId
    }).then(users => {
      updatedUser = users
      return bcrypt.hash(newpassword, 12)
    }).then(hashedpassword => {
      updatedUser.password = hashedpassword
      updatedUser.conform = hashedpassword
      updatedUser.resetToken = undefined
      updatedUser.resetTokenExpiration = undefined
      return updatedUser.save()
    }).then(result => {
      res.redirect('/log')
    })
  },

  getCart: async (req, res) => {
    const count = null
    const id = req.session.user._id
    const user = req.session.user
    const coupons = await Coupons.find({ usageLimit: { $gt: 0 } })
    const useer = await User.findById(id)
    useer.populate('cart.items.product_id')
      .execPopulate()
      .then(cartz => {
        res.render('user/cart', { user, cartz, count, coupons, id })
      })
  },

  getAddcart: async (req, res) => {
    const user = req.session.user._id
    const useer = await User.findById(user)
    const proId = req.query.Proid
    Product.findById(proId).then((product) => {
      useer.addCart(product).then(() => {
        res.redirect('/cart')
      }).catch((err) => console.log(err))
    })
  },

  addCartHome: async (req, res) => {
    const user = req.session.user._id
    const useer = await User.findById(user)
    const proId = req.body.productId
    Product.findById(proId).then((product) => {
      useer.addCart(product).then((response) => {
        const count = useer.count()
        res.json({ response, count, access: true })
      }).catch((err) => console.log(err))
    })
  },

  ChangeQuantity: async (req, res) => {
    const user = req.session.user._id
    const useer = await User.findById(user)
    useer.changeQty(req.body.productId, req.body.quantys, req.body.count, (response) => {
      response.access = true
      console.log(response)
      res.json(response)
    })
  },

  addaddress: async (req, res) => {
    let count = null
    const user = req.session.user
    const useer = await User.findById(user._id)
    count = useer.count()
    res.render('user/addaddress', { user: req.session.user, count })
  },

  newaddress: async (req, res) => {
    const {
      fullName,
      phone,
      houseName,
      city,
      pincode,
      state
    } = req.body
    const userId = req.session.user._id
    const exist = await AddressModel.findOne({ userId })
    if (exist) {
      await AddressModel.findOneAndUpdate({
        userId
      }, {
        $push: {
          address: {
            fullName,
            phone,
            houseName,
            city,
            pincode,
            state
          }
        }
      }).then(() => {
        console.log('address added')
        res.redirect('/profile')
      })
    } else {
      const address = new AddressModel({
        userId,
        address: [
          {
            fullName,
            phone,
            houseName,
            city,
            pincode,
            state
          }
        ]
      })
      await address.save().then(() => {
        console.log('address added')
        res.redirect('/')
      }).catch(() => {
        res.redirect('/')
      })
    }
  },

  getprofile: async (req, res) => {
    let address3 = null
    const count = null
    const userId = req.session.user._id
    const type = await Category.find()
    const users = await User.findOne({ _id: userId })
    const address = await AddressModel.findOne({ userId })
    if (address) {
      address3 = address.address
    }
    res.render('user/profile', {
      user: req.session.user,
      users,
      count,
      address3,
      address,
      type,
      index: 1,
      login: true
    })
  },

  deleteAddress: async (req, res) => {
    const userId = req.session.user._id
    const addressId = req.params.id
    await AddressModel.findOneAndUpdate(
      { userId },
      { $pull: { address: { _id: addressId } } }
    ).then(() => {
      res.redirect('/profile')
    })
  },

  getWish: async (req, res) => {
    try {
      const user = req.session.user
      const id = req.session.user._id.toString()
      const prd = await Wishlist.findOne({ userId: id }).populate('productItems')
      console.log('eeeeeee', prd)
      const count = null
      res.render('user/wishlist', { user, prd, count })
    } catch (err) {
      console.log(err)
    }
  },

  updateWishlist: async (req, res) => {
    const id = req.session.user._id
    const products = req.params.id
    const wish = await Wishlist.findOne({ userId: id })
    if (wish) {
      wish.addToWishlist(products, async (response) => {
        // const proDt = await Wishlist.find({ userId: id }, { productItems: 1, _id: 0 }).populate('productItems')
        if (response.status) {
          console.log('entered ')
          res.redirect('/wishlist')
        } else {
          res.redirect('/categorypage')
        }
      })
    } else {
      const newWishlist = new Wishlist({
        userId: id,
        productId: products
      })
      newWishlist.save((_err, doc) => {
        if (doc) {
          res.redirect('/wishlist')
        } else {
          res.redirect('/categorypage')
        }
      })
    }
  },

  DeleteWishlist: (req, res) => {
    const id = req.session.user._id
    const products = req.params.id
    const response = {}
    Wishlist.updateOne({ userId: id }, { $pull: { productItems: products } }).then(() => {
      response.access = true
      res.redirect('/wishlist')
    })
  },

  getcheckout: async (req, res) => {
    try {
      const userIdss = req.query.user
      const Couponcode = req.query.code
      const total = req.query.total
      if (Couponcode !== '') {
        const coupons = await Coupons.findOne({ code: Couponcode })
        const indexs = await coupons.userUsed.findIndex(obj => obj.userId === userIdss)
        if (indexs >= 0) {
          console.log('user exist')
          req.flash('error', 'Sorry You Already used the coupon')
        } else {
          const user = { userId: '' }
          user.userId = userIdss
          await Coupons.findOneAndUpdate({ code: Couponcode }, { $addToSet: { userUsed: user } })
          const useer = await User.findOne({ _id: userIdss })
          useer.cart.totalPrice = total
          await useer.save()
        }
      }
      const count = null
      let index = Number(req.body.index)
      if (!index) {
        index = 0
      }
      console.log(index + 'index')
      const userId = req.session.user._id
      const user = req.session.user
      const addresses = await AddressModel.findOne({ userId })
      console.log('rrrrrrrrr', addresses)
      let address
      if (addresses) {
        address = addresses.address
      } else {
        address = []
      }
      const cartItems = await User.findById(userId)
      console.log('heeeeeeee', cartItems)
      console.log('pppppppp', address)
      if (cartItems) {
        res.render('user/checkout', { address, index, cartItems, count, user })
      } else {
        res.redirect('/log')
      }
    } catch (err) {
      console.log(err)
    }
  },

  updateProfile: async (req, res) => {
    try {
      if (req.session.user) {
        const { name, email, phone } = req.body
        const details = await User.findOneAndUpdate({ _id: req.params.id }, { $set: { name, email, phone } })
        await details.save()
          .then(() => {
            console.log('findddddd', details)
            res.redirect('/profile')
          })
      } else {
        res.redirect('/log')
      }
    } catch (err) {
      res.console.log(err)
    }
  },

  editprofilepage: async (req, res) => {
    try {
      const count = null
      if (req.session.user) {
        const id = req.query.id
        const profile = await User.findById({ _id: id })
        console.log('newwwwwww', profile)
        res.render('user/editprofile', { user: req.session.user, profile, count })
      } else {
        res.redirect('/log')
      }
    } catch (err) {
      res.console.log(err)
    }
  },

  productSearching: async (req, res) => {
    const proKey = req.query.category
    const allProducts = await Product.find({
      title: { $regex: new RegExp('^' + proKey + '.*', 'i') }
    })
    res.json(allProducts)
  },

  orderconfirm: async (req, res) => {
    try {
      console.log('bodyyyyyyy', req.query)
      const paymentMethod = req.query.paymentMethod
      const userId = req.session.user._id
      const indexof = parseInt(req.query.index)
      req.session.index = indexof
      const addresses = await AddressModel.findOne({ userId })
      const address = addresses.address[indexof]
      const carts = await User.findById(userId).populate('cart.items.product_id')
      const productIds = carts.cart.items
      console.log('itemmmmm', productIds)
      const grandTotal = carts.cart.totalPrice
      console.log(grandTotal)
      let addOrder
      if (paymentMethod === 'COD') {
        addOrder = await OrderModel({
          userId,
          productIds,
          address,
          grandTotal,
          paymentMethod
        })
        addOrder.save()
        console.log('sucesssssss')
        carts.cart.items = []
        carts.cart.totalPrice = null
        await carts.save()
        res.json({ payment: 'COD' })
      } else {
        const instance = new Razorpay({
          key_id: keyIdEnv,
          key_secret: keySecretEnv
        })
        const options = {
          amount: grandTotal * 100,
          currency: 'INR'
        }
        instance.orders.create(options, (err, order) => {
          if (err) {
            console.log(err)
          } else {
            console.log('1111111111111rrrrrrrrrrrrrrrr')
            res.json(order)
            console.log('orderrrrrrr', order)
          }
        })
      }
    } catch (err) {
      res.json('Something wrong, please try again')
    }
  },

  editAddress: async (req, res) => {
    const addId = req.params.id
    const userid = req.body.userId
    console.log('userrrrrr', userid)
    const upAd = {
      fullName: req.body.fullName,
      phone: req.body.phone,
      houseName: req.body.houseName,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode
    }
    const addDoc = await AddressModel.findOne({ userId: userid })
    console.log('newwwwwwwwww', addDoc)
    addDoc.editAdd(upAd, addId).then((doc) => {
      res.redirect('/profile')
    })
  },

  getOrders: async (req, res) => {
    try {
      const user = req.session.user
      const orders = await OrderModel.find({ userId: user._id })
        .sort({ _id: -1 }).populate('userId').populate('productIds.product_id')
      console.log(orders)
      res.render('user/order', { user, orders })
    } catch (err) {
      res.json('Something wrong, please try again')
    }
  },

  couponCheck: async (req, res) => {
    const total = parseInt(req.body.total)
    const coupon = await Coupons.findOne({ code: req.body.code })
    if (coupon && coupon.minCartAmount <= total) {
      const amount = coupon.amount
      const cartTotal = total - amount
      res.json({ status: true, total: cartTotal })
    } else {
      console.log('false')
      res.json({ status: false, message: 'No such coupon' })
    }
  },

  Addgetcheckout: async (req, res) => {
    try {
      const count = null
      let index = Number(req.body.index)
      if (!index) {
        index = 0
      }
      console.log(index + 'index')
      const userId = req.session.user._id
      const user = req.session.user
      const addresses = await AddressModel.findOne({ userId })
      console.log('rrrrrrrrr', addresses)
      let address
      if (addresses) {
        address = addresses.address
      } else {
        address = []
      }
      const cartItems = await User.findById(userId)
      console.log('heeeeeeee', cartItems)
      console.log('pppppppp', address)
      if (cartItems) {
        res.render('user/checkout', { address, index, cartItems, count, user })
      } else {
        res.redirect('/log')
      }
    } catch (err) {
      console.log(err)
    }
  },

  addCart: async (req, res) => {
    const user = req.session.user._id
    const useer = await User.findById(user)
    const proId = req.body.productId
    console.log('userrrrrr', user)
    console.log('prooooooo', proId)
    Product.findById(proId).then((product) => {
      useer.addCart(product).then((response) => {
        const count = useer.count()
        res.json({ response, count, access: true })
      }).catch((err) => console.log(err))
    })
    const listcart = await Wishlist.updateOne({ userId: user }, { $pull: { productItems: proId } })
    console.log('listtttt', listcart)
  },

  orderSuccess: (req, res) => {
    res.render('user/order-success')
  },

  getOrderData: async (req, res) => {
    try {
      const order = await OrderModel.findOne({ _id: req.body.orderId })
      res.json({
        order
      })
    } catch (err) {
      res.status(400).json({
        stat: 'failed'
      })
    }
  },

  payment: async (req, res) => {
    try {
      const index = req.session.index
      const userId = req.session.user._id
      const addresses = await AddressModel.findOne({ userId })
      const address = addresses.address[index]
      const carts = await User.findById(userId).populate('cart.items.product_id')
      const productIds = carts.cart.items
      const grandTotal = carts.cart.totalPrice
      const body = req.body.payment.razorpay_order_id + '|' + req.body.payment.razorpay_payment_id
      let cryptos
      try {
        cryptos = require('node:crypto')
      } catch (err) {
        console.error('crypto support is disabled!')
      }
      const expectedSignature = cryptos.createHmac('sha256', 'tCirRsNHMGg4pKpYUtcuoK1A')
        .update(body.toString())
        .digest('hex')
      console.log('sig received ', req.body.payment.razorpay_signature)
      console.log('sig generated ', expectedSignature)
      let addOrder
      if (expectedSignature === req.body.payment.razorpay_signature) {
        console.log('equal')
        addOrder = new OrderModel({
          userId,
          productIds,
          address,
          grandTotal,
          paymentMethod: 'Razorpay',
          payment: 'paid'
        })
        addOrder.save()
        console.log('saveeeeeeeeeeeee')
        carts.cart.items = []
        carts.cart.totalPrice = null
        await carts.save()
        res.json({ paymentSuccess: true })
      } else {
        alert('Sorry ,try again')
      }
    } catch {
      res.json('Something wrong, please try again')
    }
  },

  getSearch: async (req, res) => {
    const data = await Product.find(
      {
        $or: [
          { title: { $regex: req.query.key, $options: 'i' } },
          { description: { $regex: req.query.key, $options: 'i' } }
        ]
      }
    )
    res.send(data)
  },

  getAllProducts: async (req, res) => {
    try {
      const count = null
      const page = parseInt(req.query.page) || 1
      const limit = 9
      // const categoryId = req.query.categoryItem || ''
      // const search = req.query.search || ''
      let sort = req.query.sort || 'description'
      req.query.sort ? (sort = req.query.sort.split(',')) : (sort = [sort])
      const sortBy = {}
      if (sort[1]) {
        sortBy[sort[0]] = sort[1]
      } else {
        sortBy[sort[0]] = 'asc'
      }
      const query = {}
      if (req.query.categoryId) {
        query.category = req.query.categoryId
      }
      if (req.query.search) {
        query.$or = [
          { title: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } }
        ]
      }
      const type = await Category.find()
      const product = await Product.find(query) // { title: { $regex: search.toString(), $options: 'i' } }
        .populate('category')
        .sort(sortBy)
        .skip((page - 1) * limit)
        .limit(limit)
      const total = await Product.countDocuments(query)// title: { $regex: search, $options: 'i' }
      res.render('user/productpage', {
        login: true,
        user: req.session.user,
        product,
        type,
        count,
        page,
        hasNextPage: limit * page < total,
        hasPreviousPage: page > 1,
        PreviousPage: page - 1
      })
    } catch (error) {
      console.log(error)
    }
  }

}
