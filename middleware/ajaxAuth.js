module.exports = {
  verifyAjaxUser: (req, res, next) => {
    if (req.session.loggedIn) {
      next()
    } else {
      res.json({ access: false })
    }
  }
}
