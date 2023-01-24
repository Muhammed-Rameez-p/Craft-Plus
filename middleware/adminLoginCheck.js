module.exports = {

  adminLoginCheck: (req, res, next) => {
    console.log(req.session)
    if (req.session.adminLogIn) {
      next()
    } else {
      res.redirect('/admin')
    }
  },

  userLoginCheck: (req, res, next) => {
    console.log(req.session)
    if (req.session.loggedIn) {
      next()
    } else {
      res.redirect('/')
    }
  }
}
