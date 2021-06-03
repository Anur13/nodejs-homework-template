const express = require('express')
const logger = require('morgan')
const cors = require('cors')

const contactsRouter = require('./routes/api/contacts')
const authRouter = require('./routes/api/auth')

const app = express()

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'
require('./config/passport')

require('dotenv').config()
app.use(logger(formatsLogger))
app.use(cors())
app.use(express.json())
const path = require('path')
app.use('/api/contacts/avatars', express.static(path.join(__dirname, 'public/avatars')))
app.use('/api/contacts', contactsRouter, authRouter)

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message })
})

module.exports = app
