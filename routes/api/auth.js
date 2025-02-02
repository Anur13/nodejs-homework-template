const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const User = require('../../service/schemas/users')
const secret = process.env.SECRET
const { auth } = require('../../service')
const bCrypt = require('bcryptjs')
const multer = require('multer')
const gravatar = require('gravatar')
const path = require('path')
const compressImage = require('../helpers/imageHandler')
const Joi = require('joi')
const { v4: uuidv4 } = require('uuid')

const sender = require('../../service/emailer/nodemailer')

const tmpdir = path.join(process.cwd(), 'tmp')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tmpdir)
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

const upload = multer({ storage: storage })

const schema = Joi.object({
  password: Joi.string()
    .pattern(/^[a-zA-Z0-9]{3,30}$/)
    .min(3)
    .max(8)
    .required(),
  email: Joi.string().email().required()
})

// LOGIN//

router.post('/users/login', async (req, res, next) => {
  const { value, error } = schema.validate(req.body)
  const { email, password } = value
  if (error) {
    res.status(400).json({ message: error.message })
    return
  }
  try {
    const user = await User.findOne({ email })
    if (!user.verify) {
      res.status(400).json({
        message: 'Account not verified'
      })
    }
    if (user === null) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    const passwordCheck = await user.validPassword(password)
    if (!user || !passwordCheck) {
      res.status(401).json({
        code: 401,
        message: 'Email or password is wrong'
      })
      return
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
    res.status(400).json({ message: error.message })
  }
})

// REGISTER//

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
    const verificationToken = uuidv4()
    const hashedPass = bCrypt.hashSync(password, bCrypt.genSaltSync(6))
    const newUser = new User({ hashedPass, email, subscription, verifyToken: verificationToken, avatarURL: gravatar.url(email) })
    newUser.setPassword(password)
    await newUser.save()
    sender(email, `Please follow this link  http://localhost:3000/api/contacts/users/verify/${verificationToken} to verify your account`)

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

// LOGOUT//

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

// CHANGE AVATAR//

router.patch('/users/avatars', upload.single('avatar'), compressImage, auth, async (req, res, next) => {
  const id = req.user._id

  try {
    const newAvatarUrl = req.newUrl
    await User.findByIdAndUpdate({ _id: id }, { avatarURL: newAvatarUrl }, { new: true })

    return res.status(200).json({
      avatarURL: newAvatarUrl
    })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
})

// VERIFY TOKEN //
router.get('/users/verify/:verificationToken', async (req, res, next) => {
  const { verificationToken } = req.params
  try {
    const user = await User.findOneAndUpdate({ verifyToken: verificationToken }, { verifyToken: null, verify: true })
    if (user === null) {
      return res.status(404).json({
        message: 'User not found'
      })
    }
    res.status(200).json({
      message: 'Verification successful'
    })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
})

// SEND VERIFICATION //

const emailSchema = Joi.object({
  email: Joi.string().email().required()
})

router.post('/users/verify', async (req, res, next) => {
  const { value, error } = emailSchema.validate(req.body)
  const { email } = value
  if (error) {
    res.status(400).json({ message: error.message })
    return
  }
  try {
    const user = await User.findOne({ email })
    const verificationToken = user.verifyToken

    if (user === null) {
      return res.status(404).json({
        message: 'User not found'
      })
    }
    if (user.verify) {
      return res.status(400).json({
        message: 'Verification has already been passed'
      })
    }
    sender(email, `Your token ${verificationToken}`)
    res.status(200).json({
      message: 'Verification email sent'
    })
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
})
module.exports = router
