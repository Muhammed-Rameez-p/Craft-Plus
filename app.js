if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const mongoose = require('mongoose')

const flash = require('connect-flash')
// const multer = require('multer')
const nocache = require('nocache')

const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const session = require('express-session')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
// const { getMaxListeners } = require('process')

app.set('view engine', 'ejs')
app.set('views', 'views')
app.use(nocache())

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())
app.use(
  session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 6000000 }
  })
)
app.use(flash())
mongoose.connect(process.env.DATABASE_LOCAL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true
})
mongoose.connection.on('connected', () => console.log('Connected'))
mongoose.connection.on('error', () => console.log('Connection failed with - '))

app.use('/admin', adminRoutes)
app.use('/', shopRoutes)

app.use((req, res, next) => {
  res.status(404).render('user/404')
})

app.listen(process.env.PORT || 7000)
