const express = require('express')
const router = express.Router()
const { listContacts, getContactById, addContact, updateContact, removeContact, updateStatusContact, auth } = require('../../service')

require('dotenv').config()

router.get('/', auth, async (req, res, next) => {
  listContacts().then(data => res.send(data))
})
router.get('/:contactId', auth, (req, res) => {
  const id = req.params.contactId
  getContactById(id).then(data => (data !== undefined ? res.send(data) : res.status(404).json({ message: 'Not found' })))
})

router.post('/', auth, async (req, res, next) => {
  const { name, email, phone, favourite } = req.body

  addContact(name, email, phone, favourite)
    .then(data => res.status(201).send(data))
    .catch(error => res.status(400).json({ message: error.message }))
})

router.delete('/:contactId', auth, async (req, res, next) => {
  const id = req.params.contactId

  removeContact(id).then(data =>
    data !== undefined ? res.status(200).json({ message: 'contact deleted' }) : res.status(404).json({ message: 'Not found' })
  )
})

router.put('/:contactId', auth, async (req, res, next) => {
  const id = req.params.contactId

  updateContact(id, req.body)
    .then(data => (data !== undefined ? res.status(200).send(data) : res.status(404).json({ message: 'Contact not found' })))
    .catch(error => res.status(400).json({ message: error.message }))
})

router.patch('/:contactId/favorite', auth, async (req, res, next) => {
  const id = req.params.contactId
  if (!req.body.favorite) {
    res.status(400).json({ message: 'missing field favorite' })
  }

  updateStatusContact(id, req.body)
    .then(data => (data !== undefined ? res.status(200).send(data) : res.status(404).json({ message: 'Contact not found' })))
    .catch(error => res.status(400).json({ message: error.message }))
})

module.exports = router
