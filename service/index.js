const Contact = require('./schemas/contacts')
const passport = require('passport')

const listContacts = async () => {
  return Contact.find()
}

const getContactById = id => {
  return Contact.findOne({ _id: id })
}

const addContact = (name, email, favourite, phone) => {
  return Contact.create({ name, email, favourite, phone })
}

const updateContact = (id, body) => {
  return Contact.findByIdAndUpdate({ _id: id }, body)
}

const updateStatusContact = (id, body) => {
  return Contact.findByIdAndUpdate({ _id: id }, body)
}

const removeContact = id => {
  return Contact.findByIdAndRemove({ _id: id })
}

const auth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (!user || err) {
      return res.status(401).json({
        code: 401,
        message: 'Unauthorized'
      })
    }
    req.user = user
    next()
  })(req, res, next)
}

module.exports = {
  listContacts,
  getContactById,
  addContact,
  updateContact,
  removeContact,
  updateStatusContact,
  auth
}
