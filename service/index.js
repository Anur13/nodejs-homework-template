const Contact = require('./schemas/contacts')

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

module.exports = {
  listContacts,
  getContactById,
  addContact,
  updateContact,
  removeContact,
  updateStatusContact
}
