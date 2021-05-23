/* eslint-disable indent */
const fs = require('fs')
const path = require('path')
const FSpromises = fs.promises
const contactsPath = path.resolve(__dirname, 'contacts.json')

async function listContacts() {
  try {
    const contacts = await FSpromises.readFile(contactsPath)
    // console.log(JSON.parse(contacts))
    return JSON.parse(contacts)
  } catch (err) {
    throw new Error(err)
  }
}

async function getContactById(contactId) {
  try {
    const contacts = await listContacts()
    const foundContact = contacts.find(contact => contact.id === +contactId)
    // console.log(contacts)
    // console.log(contactId)
    return foundContact
  } catch (err) {
    throw new Error(err)
  }
}

async function removeContact(contactId) {
  try {
    const contacts = await listContacts()
    const filtredContacts = contacts.filter(contact => contact.id !== +contactId)
    const foundContact = contacts.find(contact => contact.id === +contactId)
    if (foundContact === undefined) return undefined
    // nodemon создает бесконечный цикл на записи
    // для этого создал nodemon.json
    FSpromises.writeFile(contactsPath, JSON.stringify(filtredContacts))
    return contactId
  } catch (err) {
    throw new Error(err)
  }
}

async function addContact(name, email, phone) {
  try {
    const contacts = await listContacts()
    const contact = { id: contacts.length + 5, name, email, phone }

    FSpromises.writeFile(contactsPath, JSON.stringify([...contacts, contact]))
    return contact
  } catch (err) {
    throw new Error(err)
  }
}

async function updateContact(contactId, body) {
  try {
    const contacts = await listContacts()
    let foundContact = contacts.find(contact => contact.id === +contactId)
    if (foundContact === undefined) {
      return undefined
    }
    foundContact = { id: +contactId, ...body }
    await removeContact(contactId)
    const filtredContacts = contacts.filter(contact => contact.id !== +contactId)
    FSpromises.writeFile(contactsPath, JSON.stringify([...filtredContacts, foundContact]))
    return foundContact
  } catch (err) {
    throw new Error(err)
  }
}
module.exports = { listContacts, addContact, removeContact, getContactById, updateContact }
// updateContact(9, {
//   name: 'bla bla',
//   email: 'test@gmail.com',
//   phone: '3000'
// }).then(data => console.log(data))
