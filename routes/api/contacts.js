const express = require('express')
const router = express.Router()
const service = require('../../service')

router.get('/', async (req, res, next) => {
  service.listContacts().then(data => res.send(data))
})
router.get('/:contactId', (req, res) => {
  const id = req.params.contactId
  service.getContactById(id).then(data => (data !== undefined ? res.send(data) : res.status(404).json({ message: 'Not found' })))
})

router.post('/', async (req, res, next) => {
  const { name, email, phone, favourite } = req.body
  service
    .addContact(name, email, phone, favourite)
    .then(data => res.status(201).send(data))
    .catch(error => res.status(400).json({ message: error.message }))
})

router.delete('/:contactId', async (req, res, next) => {
  const id = req.params.contactId
  service
    .removeContact(id)
    .then(data => (data !== undefined ? res.status(200).json({ message: 'contact deleted' }) : res.status(404).json({ message: 'Not found' })))
})

router.put('/:contactId', async (req, res, next) => {
  const id = req.params.contactId
  service
    .updateContact(id, req.body)
    .then(data => (data !== undefined ? res.status(200).send(data) : res.status(404).json({ message: 'Contact not found' })))
    .catch(error => res.status(400).json({ message: error.message }))
})

router.patch('/:contactId/favorite', async (req, res, next) => {
  const id = req.params.contactId
  if (!req.body.favorite) {
    res.status(400).json({ message: 'missing field favorite' })
  }
  service
    .updateContact(id, req.body)
    .then(data => (data !== undefined ? res.status(200).send(data) : res.status(404).json({ message: 'Contact not found' })))
    .catch(error => res.status(400).json({ message: error.message }))
})

module.exports = router
