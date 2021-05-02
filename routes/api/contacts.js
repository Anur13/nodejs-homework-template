const express = require('express')
const router = express.Router()
const { listContacts, getContactById, removeContact, addContact, updateContact } = require('../../model/contacts.js')
const Joi = require('joi')

router.get('/', (req, res) => {
  listContacts().then(data => res.send(data))
})

router.get('/:contactId', (req, res) => {
  const id = req.params.contactId
  getContactById(id).then(data => (data !== undefined ? res.send(data) : res.status(404).json({ message: 'Not found' })))
})

const createUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.number().required()
})
router.post('/', async (req, res, next) => {
  const { value, error } = createUserSchema.validate(req.body)
  if (error) {
    res.status(400).json({ message: error.message })
    return
  }
  const { name, email, phone } = value
  addContact(name, email, phone).then(data => res.status(201).send(data))
})

router.delete('/:contactId', async (req, res, next) => {
  const id = req.params.contactId
  removeContact(id).then(data =>
    data !== undefined ? res.status(200).json({ message: 'contact deleted' }) : res.status(404).json({ message: 'Not found' })
  )
})

router.put('/:contactId', async (req, res, next) => {
  const { value, error } = createUserSchema.validate(req.body)
  if (error) {
    res.status(400).json({ message: error.message })
    return
  }
  const id = req.params.contactId

  updateContact(id, value).then(data => (data !== undefined ? res.status(200).send(data) : res.status(404).json({ message: 'Contact not found' })))
})

module.exports = router
