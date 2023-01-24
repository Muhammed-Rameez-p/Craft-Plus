const express = require('express')
const { getAdminLogin, adminPost, getAddCategory, getAdminUsers, blockUser, unblockUser, getCategory, addCategory, getEditCategory, editCategory, getAdminProducts, getAddProductPage, editProduct, uploadProduct, getEditProductPage, listProduct, unlistProduct, listcategory, unlistcategory, getCoupon, getAddCoupon, addCoupon, getEditCoupon, editCoupon, deleteCoupon, getAdminOrders, getBanner, getAddBanner, postaddBanner, getEditBanner, posteditBanner, deleteBanner, getAdminDashboard, changeStatus, getOrderProduct, dailyReport, monthReport, yearReport, dayInvoice, getLogout, monthInvoice, yearInvoice } = require('../controllers/adminController')
const { adminLoginCheck } = require('../middleware/adminLoginCheck')
const { uploadOne, uploadMultiple, uploadBannerImg } = require('../middleware/multerMiddleware')
const router = express.Router()
// Admin loging
router.get('/', getAdminLogin)
router.post('/', adminPost)
// Admin logout
router.get('/logout', getLogout)
// Dashboard
router.get('/dashboard', adminLoginCheck, getAdminDashboard)
// User
router.get('/clients', adminLoginCheck, getAdminUsers)
router.get('/clients/block/:id', blockUser)
router.get('/clients/unblock/:id', unblockUser)
// Category
router.get('/category', adminLoginCheck, getCategory)
router.get('/category/add-category', getAddCategory)
router.post('/category/add-category', uploadOne, addCategory)
router.get('/category/edit-category/:id', getEditCategory)
router.post('/category/edit-category/:id', uploadOne, editCategory)
router.get('/category/list-category/:id', listcategory)
router.get('/category/unlist-category/:id', unlistcategory)
// Products
router.get('/products', adminLoginCheck, getAdminProducts)
router.get('/products/add-product', getAddProductPage)
router.post('/products/add-product', uploadMultiple, uploadProduct)
router.get('/products/edit-product/:id', getEditProductPage)
router.post('/products/edit-product/:id', uploadMultiple, editProduct)
router.get('/products/list-product/:id', listProduct)
router.get('/products/unlist-product/:id', unlistProduct)
// Coupon
router.get('/coupon', adminLoginCheck, getCoupon)
router.get('/coupon/add-coupon', getAddCoupon)
router.post('/coupon/add-coupon', addCoupon)
router.get('/coupon/edit-coupon/:id', getEditCoupon)
router.post('/coupon/edit-coupon/:id', editCoupon)
router.post('/coupon/delete-coupon', deleteCoupon)
// Banner
router.get('/banner', adminLoginCheck, getBanner)
router.get('/banner/add-banner', getAddBanner)
router.post('/banner/add-banner', uploadBannerImg, postaddBanner)
router.get('/banner/edit-banner/:id', getEditBanner)
router.post('/banner/edit-banner/:id', uploadBannerImg, posteditBanner)
router.post('/banner/delete-banner', deleteBanner)
// Orders
router.get('/orders', adminLoginCheck, getAdminOrders)
router.get('/orders/product', getOrderProduct)
router.get('/changeStatus', changeStatus)
// Sales Report
router.get('/dailyReport', adminLoginCheck, dailyReport)
router.get('/monthlyReport', adminLoginCheck, monthReport)
router.get('/yearlyReport', adminLoginCheck, yearReport)
// Download PDF
router.get('/dayInvoice', dayInvoice)
router.get('/monthInvoice', monthInvoice)
router.get('/yearInvoice', yearInvoice)

module.exports = router
