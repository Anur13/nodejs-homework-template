const app = require('../app')

const PORT = process.env.PORT || 3000

const uriDb = process.env.DB_HOST
const mongoose = require('mongoose')
const connection = mongoose.connect(uriDb, {
  promiseLibrary: global.Promise,
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
connection
  .then(() => {
    app.listen(PORT, function () {
      console.log('Database connection successful')
    })
  })
  .catch(err => console.log(`Server not running. Error message: ${err.message}`))
