const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const User = require('../../service/schemas/users')
const secret = process.env.SECRET
const { auth } = require('../../service')

router.post('/users/login', async (req, res, next) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    const passwordCheck = await user.validPassword(password)
    if (!user || !passwordCheck) {
      return res.status(401).json({
        code: 401,
        message: 'Incorrect login or password'
      })
    }
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
    console.log(error)
  }
})

router.post('/users/signup', async (req, res, next) => {
  const { email, password, subscription } = req.body
  const user = await User.findOne({ email })

  if (user) {
    return res.status(401).json({
      message: 'Email in use'
    })
  }
  try {
    const newUser = new User({ password, email, subscription })
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
    console.log(error)
    res.status(400).json({ message: error.message })
  }
})

router.post('/users/logout', auth, async (req, res, next) => {
  const { email, password, subscription } = req.body
  const user = await User.findOne({ email })
  if (user) {
    return res.status(409).json({
      code: 409,
      message: 'Email in use'
    })
  }
  try {
    res.status(201).json({
      status: 'success',
      code: 201
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})
module.exports = router
