// Require needed packages
require('dotenv').config()
let cors = require('cors')
let express = require('express')
let morgan = require('morgan')
let rowdyLogger = require('rowdy-logger')
let expressJwt = require('express-jwt')

// Instantiate app
let app = express()
let rowdyResults = rowdyLogger.begin(app)

// Set up middleware
app.use(morgan('dev'))
app.use(cors())
app.use(express.urlencoded({extended: false})) // Accept data from form
app.use(express.json()) // Accept data from AJAX call

// Routes
app.use('/auth', expressJwt({ // makes private
  secret: process.env.JWT_SECRET 
})
.unless({ //defines exceptions we want public
  path: [
    { url: '/auth/login', methods: ['POST'] }, 
    { url: '/auth/signup' }
  ]
}), require('./controllers/auth'))

app.get('*', (req, res) => {
  res.status(404).send({ message: 'Not Found' })
})

app.listen(process.env.PORT || 3000, () => {
  rowdyResults.print()
})
