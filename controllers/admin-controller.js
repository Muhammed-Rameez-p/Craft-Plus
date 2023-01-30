const Category = require('../models/category-model')
const Order = require('../models/order-model')
const Coupon = require('../models/coupon')
const user = require('../models/user')
const Product = require('../models/product-model')
const Banner = require('../models/banner-model')
const Admin = require('../models/admin-model')
const { getAllClients } = require('./user-data')
const mongoose = require('mongoose')
const orderModel = require('../models/order-model')
const cloudinary = require('../helper/image-upload')
const path = require('path')

module.exports = {

  getAdminLogin: (req, res) => {
    if (req.session.adminLogIn) {
      res.redirect('admin/dashboard')
    } else {
      const msg = req.flash('error')
      res.render('admin/login', { msg })
    }
  },

  adminPost: async (req, res) => {
    const admin = req.body.email
    const password = req.body.password
    const adminLogin = await Admin.findOne()
    console.log('loggggggg', adminLogin.email)
    if (admin === adminLogin.email && password === adminLogin.password) {
      req.session.adminLogIn = true
      res.redirect('/admin/dashboard')
    } else {
      req.session.adminLogErr = true
      res.redirect('/admin')
    }
  },

  getLogout: (req, res) => {
    req.session.adminLogIn = null
    res.redirect('/admin')
  },

  getAdminUsers: async (req, res) => {
    try {
      const users = await getAllClients()
      req.session.pageIn = 'users'
      res.render('admin/clients', {
        users,
        pageIn: req.session.pageIn,
        usersPage: 'dark:text-gray-100',
        dashboardPage: '',
        ordersPage: '',
        productsPage: '',
        bannerPage: '',
        categoryPage: '',
        brandPage: '',
        couponPage: ''
      })
    } catch (err) {
      res.status(400).json({
        status: 'no data in database',
        message: err
      })
    }
  },

  blockUser: async (req, res) => {
    try {
      const userId = req.params.id
      await user.findByIdAndUpdate(userId, { access: false })
      res.redirect('/admin/clients')
    } catch (err) {
      res.status(400).json({
        status: 'blocking error',
        message: err
      })
    }
  },

  unblockUser: async (req, res) => {
    try {
      const userId = req.params.id
      await user.findByIdAndUpdate(userId, { access: true })
      res.redirect('/admin/clients')
    } catch (err) {
      res.status(400).json({
        status: 'unblocking error',
        message: err
      })
    }
  },

  getCategory: async (req, res) => {
    const category = await Category.find({})
    req.session.pageIn = 'category'
    res.render('admin/category', {
      pageIn: req.session.pageIn,
      category
    })
  },

  getAddCategory: (req, res) => {
    req.session.pageIn = 'category'
    res.render('admin/add_category', {
      pageIn: req.session.pageIn
    })
  },

  addCategory: async (req, res) => {
    try {
      const catInfo = req.body
      const img = req.file.filename
      Object.assign(catInfo, { image: img })
      await Category.create(catInfo)
      res.redirect('/admin/category')
    } catch (err) {
      res.status(400).json({
        status: 'error while adding category',
        message: err
      })
    }
  },

  getEditCategory: async (req, res) => {
    const catId = req.params.id
    req.session.pageIn = 'category'
    const category = await Category.find({ _id: mongoose.Types.ObjectId(catId) })
    res.render('admin/edit_category', {
      category,
      catId,
      pageIn: req.session.pageIn
    })
  },

  editCategory: async (req, res) => {
    try {
      if (req.file === undefined) {
        await Category.findByIdAndUpdate(req.params.id, req.body, {
          upsert: true,
          new: true,
          runValidators: true
        })
        res.redirect('/admin/category')
      } else {
        const catInfo = req.body
        const img = req.file.filename
        Object.assign(catInfo, { image: img })
        await Category.findByIdAndUpdate(req.params.id, catInfo)
        res.redirect('/admin/category')
      }
    } catch (err) {
      res.status(400).json({
        status: 'error while editing category',
        message: err
      })
    }
  },

  getAdminProducts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1
      const itemsPerPage = 9
      const totalproducts = await Product.find().countDocuments()
      const products = await Product.find().populate('category').skip((page - 1) * itemsPerPage).limit(itemsPerPage)
      req.session.pageIn = 'products'
      res.render('admin/product_management', {
        hasNextPage: itemsPerPage * page < totalproducts,
        hasPreviousPage: page > 1,
        PreviousPage: page - 1,
        products,
        page,
        pageIn: req.session.pageIn
      })
    } catch (err) {
      res.status(400).json({
        status: 'no data in database',
        message: err
      })
    }
  },

  getAddProductPage: async (req, res) => {
    const category = await Category.find({})
    const msg = req.flash('error')
    req.session.pageIn = 'products'
    res.render('admin/add_product', {
      msg,
      category,
      pageIn: req.session.pageIn
    })
  },

  uploadProduct: async (req, res) => {
    try {
      const img = []
      const thumbnail = req.files.thumbnail[0].filename
      req.files.images.forEach((el) => {
        img.push(el.filename)
      })
      console.log('fileeee')
      Object.assign(req.body, { images: img, thumbnail })
      const result = await cloudinary.uploader.upload(req.files.thumbnail[0].path, {
        public_id: 'img-' + Date.now() + path.extname(req.files.thumbnail[0].originalname)
      })
      console.log('img---------', result)
      res.redirect('/admin/products')
    } catch (err) {
      console.log(err)
      req.flash('error', 'An Error occured while adding product to database')
      res.redirect('/admin/products/add-product')
    }
  },

  getEditProductPage: async (req, res) => {
    const category = await Category.find({})
    const product = await Product.find({ _id: mongoose.Types.ObjectId(req.params.id) })
      .populate('category')
    const userId = req.params.id
    req.session.pageIn = 'products'
    res.render('admin/edit_product', {
      category,
      product: product[0],
      userId,
      pageIn: req.session.pageIn
    })
  },

  editProduct: async (req, res) => {
    console.log(req.files)
    if (Object.keys(req.files).length === 0) {
      await Product.findByIdAndUpdate(req.params.id, req.body, {
        upsert: true,
        new: true,
        runValidators: true
      })
      res.redirect('/admin/products')
    } else if (req.files.images === undefined && req.files.thumbnail.length !== 0) {
      const thumbnail = req.files.thumbnail[0].filename
      Object.assign(req.body, { thumbnail })
      await Product.findByIdAndUpdate(req.params.id, req.body, {
        upsert: true,
        new: true,
        runValidators: true
      })
      res.redirect('/admin/products')
    } else if (req.files.thumbnail === undefined && req.files.images.length !== 0) {
      const img = []
      req.files.images.forEach((el) => {
        img.push(el.filename)
      })
      Object.assign(req.body, { images: img })
      await Product.findByIdAndUpdate(req.params.id, req.body, {
        upsert: true,
        new: true,
        runValidators: true
      })
      res.redirect('/admin/products')
    } else {
      const img = []
      const thumbnail = req.files.thumbnail[0].filename
      req.files.images.forEach((el) => {
        img.push(el.filename)
      })
      Object.assign(req.body, { images: img, thumbnail })
      await Product.findByIdAndUpdate(req.params.id, req.body, {
        upsert: true,
        new: true,
        runValidators: true
      })
      res.redirect('/admin/products')
    }
  },

  unlistProduct: async (req, res) => {
    await Product.findByIdAndUpdate(req.params.id, { access: false })
    res.redirect('/admin/products')
  },

  listProduct: async (req, res) => {
    await Product.findByIdAndUpdate(req.params.id, { access: true })
    res.redirect('/admin/products')
  },

  unlistcategory: async (req, res) => {
    await Category.findByIdAndUpdate(req.params.id, { access: false })
    res.redirect('/admin/category')
  },

  listcategory: async (req, res) => {
    await Category.findByIdAndUpdate(req.params.id, { access: true })
    res.redirect('/admin/category')
  },

  getCoupon: async (req, res) => {
    const coupon = await Coupon.find({})
    req.session.pageIn = 'coupon'
    res.render('admin/coupon', {
      pageIn: req.session.pageIn,
      coupon
    })
  },

  getAddCoupon: (req, res) => {
    req.session.pageIn = 'coupon'
    res.render('admin/add_coupon', {
      pageIn: req.session.pageIn
    })
  },

  addCoupon: async (req, res) => {
    try {
      const { code, isPercent, amount, usageLimit, minCartAmount } = req.body
      const createdAt = new Date()
      let expireAfter = createdAt.getTime() + req.body.expireAfter * 24 * 60 * 60 * 1000
      expireAfter = new Date(expireAfter)
      const coupon = { code, isPercent, amount, usageLimit, expireAfter, createdAt, minCartAmount }
      await Coupon.create(coupon)
      res.redirect('/admin/coupon')
    } catch (err) {
      res.status(400).json({
        status: 'error while adding coupon',
        message: err
      })
    }
  },

  getEditCoupon: async (req, res) => {
    const couponId = req.params.id
    req.session.pageIn = 'coupon'
    const coupon = await Coupon.find({ _id: mongoose.Types.ObjectId(couponId) })
    res.render('admin/edit_coupon', {
      coupon,
      couponId,
      pageIn: req.session.pageIn
    })
  },

  editCoupon: async (req, res) => {
    try {
      const { code, isPercent, amount, usageLimit, minCartAmount } = req.body
      const coupon = { code, isPercent, amount, usageLimit, minCartAmount }
      await Coupon.findByIdAndUpdate(req.params.id, coupon)
      res.redirect('/admin/coupon')
    } catch (err) {
      res.status(400).json({
        status: 'error while editing coupon',
        message: err
      })
    }
  },

  deleteCoupon: async (req, res) => {
    try {
      console.log(req.body)
      await Coupon.findByIdAndDelete(req.body.couponId)
      res.json({
        delete: 'success'
      })
    } catch (err) {
      res.json({
        delete: 'failed'
      })
    }
  },

  getAdminOrders: async (req, res) => {
    const orders = await Order.find({}).sort({ _id: -1 }).populate('userId').populate('productIds.product_id')
    req.session.pageIn = 'orders'
    res.render('admin/orders', {
      orders,
      pageIn: req.session.pageIn
    })
  },

  getBanner: async (req, res) => {
    const banner = await Banner.find({})
    req.session.pageIn = 'banner'
    res.render('admin/banner', {
      pageIn: req.session.pageIn,
      banner
    })
  },

  getAddBanner: (req, res) => {
    req.session.pageIn = 'banner'
    res.render('admin/add_banner', {
      pageIn: req.session.pageIn
    })
  },

  postaddBanner: async (req, res) => {
    try {
      const bannerInfo = req.body
      const img = req.file.filename
      Object.assign(bannerInfo, { image: img })
      await Banner.create(bannerInfo)
      res.redirect('/admin/banner')
    } catch (err) {
      res.status(400).json({
        status: 'error while adding banner',
        message: err
      })
    }
  },

  getEditBanner: async (req, res) => {
    const bannerId = req.params.id
    req.session.pageIn = 'banner'
    const banner = await Banner.find({ _id: mongoose.Types.ObjectId(bannerId) })
    res.render('admin/edit_banner', {
      banner,
      bannerId,
      pageIn: req.session.pageIn
    })
  },

  posteditBanner: async (req, res) => {
    try {
      if (req.file === undefined) {
        await Banner.findByIdAndUpdate(req.params.id, req.body, {
          upsert: true,
          new: true,
          runValidators: true
        })
        res.redirect('/admin/banner')
      } else {
        const bannerInfo = req.body
        const img = req.file.filename
        Object.assign(bannerInfo, { image: img })
        await Banner.findByIdAndUpdate(req.params.id, req.body, {
          upsert: true,
          new: true,
          runValidators: true
        })
        res.redirect('/admin/banner')
      }
    } catch (err) {
      res.status(400).json({
        status: 'error while editing banner',
        message: err
      })
    }
  },

  deleteBanner: async (req, res) => {
    try {
      console.log(req.body)
      await Banner.findByIdAndDelete(req.body.bannerId)
      res.json({
        delete: 'success'
      })
    } catch (err) {
      res.json({
        delete: 'failed'
      })
    }
  },

  getAdminDashboard: async (req, res) => {
    const orders = await Order.find({}).sort({ _id: -1 }).limit(10).populate('userId').populate('address')
    const userCount = await user.countDocuments()
    const pending = await Order.aggregate([
      {
        $match: { orderstat: { $ne: 'DELIVERED' } }
      },
      {
        $group: { _id: '$__v', count: { $sum: 1 } }
      }
    ])
    const totalOrder = await Order.aggregate([
      {
        $match: { orderstat: { $eq: 'DELIVERED' } }
      },
      {
        $group: { _id: '$__v', count: { $sum: 1 } }
      }
    ])
    const sale = await Order.aggregate([
      { $match: { orderstat: { $eq: 'DELIVERED' } } },
      {
        $group: {
          _id: {
            month: { $month: '$date' }
          },
          totalPrice: { $sum: '$grandTotal' },
          items: { $sum: { $size: '$productIds' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { date: 1 } }
    ])
    req.session.pageIn = 'dashboard'
    const msg = req.flash('success')
    res.render('admin/dashboard', {
      orders,
      msg,
      totalOrder,
      sale,
      pending,
      userCount,
      pageIn: req.session.pageIn
    })
  },

  changeStatus: (req, res) => {
    const status = req.query.s
    const orederId = req.query.id
    const response = {}
    if (status === 'DELIVERED' || status === 'CANCELLED') {
      orderModel.findOneAndUpdate({ _id: orederId }, { $set: { orderstat: status } }).then(() => {
        response.status = false
        response.value = status
        res.json(response)
      })
    } else {
      orderModel.findOneAndUpdate({ _id: orederId }, { $set: { orderstat: status } }).then(() => {
        response.status = true
        res.json(response)
      })
    }
  },

  getOrderProduct: async (req, res) => {
    try {
      const proId = req.query.proId
      req.session.pageIn = 'orders'
      console.log('proiddddddd', proId)
      const productlist = await orderModel.findOne({ _id: proId })
        .sort({ _id: -1 }).populate('userId').populate('productIds.product_id')
      res.render('admin/order-product', { productlist, pageIn: req.session.pageIn })
    } catch (err) {
      res.json('Something wrong, please try again')
    }
  },

  dailyReport: async (req, res) => {
    req.session.pageIn = 'sales'
    const sales = await orderModel.aggregate([
      { $match: { orderstat: { $eq: 'DELIVERED' } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          totalPrice: { $sum: '$grandTotal' },
          items: { $sum: { $size: '$productIds' } },
          count: { $sum: 1 }
        }
      }, {
        $sort: {
          '_id.year': -1,
          '_id.month': -1,
          '_id.day': -1
        }
      }
    ])
    res.render('admin/daily-report', { sales, pageIn: req.session.pageIn })
  },

  monthReport: async (req, res) => {
    req.session.pageIn = 'sales'
    const months = [
      'January', 'February', 'March',
      'April', 'May', 'June',
      'July', 'August', 'September',
      'October', 'November', 'December'
    ]
    const sale = await orderModel.aggregate([
      { $match: { orderstat: { $eq: 'DELIVERED' } } },
      {
        $group: {
          _id: {
            month: { $month: '$date' }
          },
          totalPrice: { $sum: '$grandTotal' },
          items: { $sum: { $size: '$productIds' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { date: 1 } }
    ])
    const sales = sale.map((el) => {
      const newOne = { ...el }
      newOne._id.month = months[newOne._id.month - 1]
      return newOne
    })
    res.render('admin/monthly-report', { sales, pageIn: req.session.pageIn })
  },

  yearReport: async (req, res) => {
    req.session.pageIn = 'sales'
    const sales = await orderModel.aggregate([
      { $match: { orderstat: { $eq: 'DELIVERED' } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' }
          },
          totalPrice: { $sum: '$grandTotal' },
          items: { $sum: { $size: '$productIds' } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': -1 }
      }
    ])
    res.render('admin/yearly-report', { sales, pageIn: req.session.pageIn })
  },

  dayInvoice: async (req, res) => {
    req.session.pageIn = 'sales'
    const sales = await orderModel.aggregate([
      { $match: { orderstat: { $eq: 'DELIVERED' } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          totalPrice: { $sum: '$grandTotal' },
          items: { $sum: { $size: '$productIds' } },
          count: { $sum: 1 }
        }
      }, {
        $sort: {
          '_id.year': -1,
          '_id.month': -1,
          '_id.day': -1
        }
      }
    ])
    res.render('admin/day-invoice', { sales, pageIn: req.session.pageIn })
  },

  monthInvoice: async (req, res) => {
    req.session.pageIn = 'sales'
    const months = [
      'January', 'February', 'March',
      'April', 'May', 'June',
      'July', 'August', 'September',
      'October', 'November', 'December'
    ]
    const sale = await orderModel.aggregate([
      { $match: { orderstat: { $eq: 'DELIVERED' } } },
      {
        $group: {
          _id: {
            month: { $month: '$date' }
          },
          totalPrice: { $sum: '$grandTotal' },
          items: { $sum: { $size: '$productIds' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { date: 1 } }
    ])
    const sales = sale.map((el) => {
      const newOne = { ...el }
      newOne._id.month = months[newOne._id.month - 1]
      return newOne
    })
    res.render('admin/month-invoice', { sales, pageIn: req.session.pageIn })
  },

  yearInvoice: async (req, res) => {
    req.session.pageIn = 'sales'
    const sales = await orderModel.aggregate([
      { $match: { orderstat: { $eq: 'DELIVERED' } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' }
          },
          totalPrice: { $sum: '$grandTotal' },
          items: { $sum: { $size: '$productIds' } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': -1 }
      }
    ])
    res.render('admin/year-invoice', { sales, pageIn: req.session.pageIn })
  },

  getSalesDate: (req, res) => {
    try {
      req.session.pageIn = 'sales'
      res.render('admin/sales-date', { pageIn: req.session.pageIn })
    } catch (err) {
      console.log(err)
    }
  },

  toSalesReport: async (req, res) => {
    try {
      req.session.pageIn = 'sales'
      const sales = await orderModel.aggregate([
        {
          $match: {
            orderstat: { $eq: 'DELIVERED' },
            $and: [
              { createdAt: { $gt: new Date(req.body.from) } },
              { createdAt: { $lt: new Date(req.body.to) } }
            ]
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
              day: { $dayOfMonth: '$date' }
            },
            totalPrice: { $sum: '$grandTotal' },
            items: { $sum: { $size: '$productIds' } },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ])
      console.log(sales)
      res.render('admin/date-invoice', {
        sales,
        pageIn: req.session.pageIn
      })
    } catch (error) {
      console.log(error)
      error.admin = true
    }
  }
}
