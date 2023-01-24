const path = require('path')
const multer = require('multer')

const imageStorage = multer.diskStorage({
  destination: 'public/product_img',
  filename: (req, file, cb) => {
    cb(null, 'img-' + Date.now() + path.extname(file.originalname))
  }
})

const imageUpload = multer({
  storage: imageStorage
})

const catImageStorage = multer.diskStorage({
  destination: 'public/category_img',
  filename: (req, file, cb) => {
    cb(null, 'cat-img-' + Date.now() + path.extname(file.originalname))
  }
})
const catImageUpload = multer({
  storage: catImageStorage
})

const bannerImageStorage = multer.diskStorage({
  destination: 'public/banner_img',
  filename: (req, file, cb) => {
    cb(null, 'banner-img-' + Date.now() + path.extname(file.originalname))
  }
})

const bannerImageUpload = multer({
  storage: bannerImageStorage
})

const uploadMultiple = imageUpload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'images', maxCount: 4 }])
const uploadOne = catImageUpload.single('image')
const uploadBannerImg = bannerImageUpload.single('image')

module.exports = { uploadOne, uploadMultiple, uploadBannerImg }
