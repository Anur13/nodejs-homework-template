const mongoose = require('mongoose')
const bCrypt = require('bcryptjs')

const Schema = mongoose.Schema

const userSchema = new Schema({
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true
  },
  subscription: {
    type: String,
    enum: ['starter', 'pro', 'business'],
    default: 'starter'
  },
  token: {
    type: String,
    default: null
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  }
})

userSchema.methods.setPassword = async function (password) {
  this.password = await bCrypt.hashSync(password, bCrypt.genSaltSync(6))
}

userSchema.methods.validPassword = async function (password) {
  return await bCrypt.compareSync(password, this.password)
}

const User = mongoose.model('user', userSchema)

module.exports = User
