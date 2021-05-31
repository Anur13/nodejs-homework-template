const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const User = require('../../service/schemas/users')
const secret = process.env.SECRET
const { auth } = require('../../service')
const bCrypt = require('bcryptjs')

const Joi = require('joi')

const schema = Joi.object({
  password: Joi.string()
    .pattern(/^[a-zA-Z0-9]{3,30}$/)
    .min(3)
    .max(8)
    .required(),
  email: Joi.string().email().required()
})

router.post('/users/login', async (req, res, next) => {
  const { value, error } = schema.validate(req.body)
  const { email, password } = value
  if (error) {
    res.status(400).json({ message: error.message })
    return
  }

  try {
    const user = await User.findOne({ email })
    const passwordCheck = await user.validPassword(password)
    if (!user || !passwordCheck) {
      return res.status(401).json({
        code: 401,
        message: 'Email or password is wrong'
      })
    }
    const hashedPass = bCrypt.hashSync(password, bCrypt.genSaltSync(6))
    const payload = {
      id: user.id,
      username: user.username
    }
    const token = jwt.sign(payload, secret, { expiresIn: '1h' })
    await User.findByIdAndUpdate({ _id: payload.id }, { ...req.body, password: hashedPass, token })
    res.json({
      status: 'success',
      code: 200,
      data: {
        token
      }
    })
  } catch (error) {
    res.status(400).json({ message: error })
  }
})

router.post('/users/signup', async (req, res, next) => {
  const { value, error } = schema.validate(req.body)
  const { email, password, subscription } = value
  const user = await User.findOne({ email })
  if (error) {
    return res.status(400).json({ message: error.message })
  }
  if (user) {
    return res.status(401).json({
      message: 'Email in use'
    })
  }
  try {
    const hashedPass = bCrypt.hashSync(password, bCrypt.genSaltSync(6))
    const newUser = new User({ hashedPass, email, subscription })
    newUser.setPassword(password)
    await newUser.save()
    res.status(201).json({
      status: 'success',
      code: 201,
      user: {
        email: email,
        subscription: subscription
      }
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.post('/users/logout', auth, async (req, res, next) => {
  const id = req.user._id
  try {
    await User.findByIdAndUpdate({ _id: id }, { token: null }, { new: true })
    res.status(204).json({
      message: 'success'
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

router.post('/users/current', auth, async (req, res, next) => {
  const { email, subscription } = req.user
  res.status(200).json({
    message: { email, subscription }
  })
})
module.exports = router
