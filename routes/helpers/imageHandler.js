const Jimp = require('jimp')
const fs = require('fs')
const FSpromises = fs.promises
const path = require('path')

const uploadDir = path.join(process.cwd(), 'public/avatars')
const tmpdir = path.join(process.cwd(), 'tmp')

async function compressImage(req, res, next) {
  const file = req.file
  if (!file) {
    return next(new Error('No file detected'))
  }
  const originalFilePath = req.file.path
  try {
    const image = await Jimp.read(file.path)
    file.destination = file.path.replace(tmpdir, uploadDir)
    file.path = file.path.replace(tmpdir, uploadDir)
    const filePath = path.join(uploadDir, file.originalname)
    await image.resize(250, 250).quality(60).write(filePath)
    await FSpromises.unlink(originalFilePath)
    const myURL = new URL(file.originalname, 'http://localhost:3000/api/contacts/avatars/')
    req.newUrl = myURL.href
    next()
  } catch (err) {
    next(err)
    await FSpromises.unlink(originalFilePath)
  }
}

module.exports = compressImage
