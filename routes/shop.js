const express = require('express')
const router = express.Router()
const { postlogin, singup, postsingupview, postotp, postResendOtp, getUserHome, categorylisting, productpage, categorypage, getReset, postReset, getNewPassword, postResetPassword, getCart, getLoging, getHome, getAddcart, addCartHome, ChangeQuantity, addaddress, newaddress, getprofile, getotp, getWish, updateWishlist, getcheckout, DeleteWishlist, getsingleProduct, updateProfile, editprofilepage, productSearching, orderconfirm, editAddress, getOrders, couponCheck, Addgetcheckout, addCart, orderSuccess, getOrderData, payment, deleteAddress, getSearch, getContact, getAllProducts, getUserLogout } = require('../controllers/user-controller')
const { verifyAjaxUser } = require('../middleware/ajax-auth')
const { userLoginCheck } = require('../middleware/admin-login-check')
// Home & Loging
router.get('/', getUserHome)
router.get('/home', getHome)
router.get('/log', getLoging)
router.post('/log', postlogin)
// Logout
router.get('/logout', getUserLogout)
// Contact
router.get('/contact', getContact)
// Products
router.get('/allProduct', getAllProducts)
router.get('/categorypage', categorypage)
router.get('/category', categorylisting)
router.get('/productpage', productpage)
// User Signup
router.get('/signup', singup)
router.post('/signup', postsingupview)
// OTP & Reset Password
router.get('/getotp', getotp)
router.post('/otp', postotp)
router.get('/resendotp', postResendOtp)
router.get('/reset', getReset)
router.post('/reset', postReset)
router.get('/resets', getNewPassword)
router.post('/new-password', postResetPassword)
// Cart
router.get('/cart', getCart)
router.get('/add-to-cart', getAddcart)
router.post('/addCartHome', verifyAjaxUser, addCartHome)
router.post('/addCart', addCart)
router.post('/changeQty', ChangeQuantity)
// Address
router.get('/addaddress', userLoginCheck, addaddress)
router.post('/addnewaddress', newaddress)
router.post('/edit-address/:id', editAddress)
router.post('/deleteAddress/:id', deleteAddress)
// Profile
router.get('/profile', userLoginCheck, getprofile)
router.post('/updateProfile/:id', updateProfile)
router.get('/editprofilepage', userLoginCheck, editprofilepage)
// Wishlist
router.get('/wishlist', userLoginCheck, getWish)
router.get('/update-wishlist/:id', userLoginCheck, updateWishlist)
router.post('/removewishlistproduct/:id', DeleteWishlist)
// Checkout & Payment
router.get('/checkout', userLoginCheck, getcheckout)
router.post('/Addcheckout', Addgetcheckout)
router.get('/payment-verify', orderconfirm)
router.post('/verify', payment)
router.get('/order-success', orderSuccess)
// Single Product
router.get('/singleProduct', getsingleProduct)
// order
router.get('/orders', userLoginCheck, getOrders)
router.post('/orders', getOrderData)
// Coupon
router.post('/couponCheck', couponCheck)
// Search
router.get('/productSearching', productSearching)
router.get('/Search', getSearch)

module.exports = router
