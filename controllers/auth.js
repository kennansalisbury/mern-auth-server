require('dotenv').config()
let router = require('express').Router()
let db = require('../models')
let jwt = require('jsonwebtoken')

// POST /auth/login (find and validate user; send token)
router.post('/login', (req, res) => {
  //Find the user, check if existing
  db.User.findOne({
    email: req.body.email
  }).then(user => {
    //make sure user exists and has a password
    if(!user || !user.password) {
      return res.status(404).send({ message: 'User not found' })
    }
    
    //if user exists, check password
    if(!user.isValidPassword(req.body.password)) {
      return res.status(401).send({ message: 'Invalid credentials' })
    }

    //good user - issue token
    let token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
      expiresIn: 60 * 60 * 8
    })
    res.send( {token} )
  })
  .catch(err => {
    console.log(err)
    res.status(503).send({message: 'Database error' })
  })
})

// POST to /auth/signup (create user; generate token)
router.post('/signup', (req, res) => {
  //look up user to make sure doesn't already exist
  db.User.findOne({
    email: req.body.email
  })
  .then(user => {
    // If the user exists, do not let them create a new account
    if(user){
      return res.status(409).send({ message: 'Email address in use!' })
    }
    // Otherwise, create new user, make them a token and send to caller

      db.User.create(req.body)
      .then(newUser => {
        //Make new user a token
        let token = jwt.sign(newUser.toJSON(), process.env.JWT_SECRET, {
          expiresIn: 60 * 60 * 8  //do shorter for dev/testing purposes, longer for deployment
        })
        //Send token
        res.send( {token} )
      })
      .catch(err => {
        if(err.name === 'ValidationError') {
          console.log(err)
          res.status(406).send({ message: 'Validation error!' })
        }
        else {
          console.log('Error creating user', err)
          res.status(500).send({message: 'Error creating user' })
        }

      })
    
  })
  .catch(err => {
    console.log(err)
    res.status(503).send({message: 'Database error' })
  })

})

// NOTE: User should be logged in to access this route
router.get('/profile', (req, res) => {
  // The user is logged in, so req.user should have data!
  // TODO: Anything you want here!

  // NOTE: This is the user data from the time the token was issued
  // WARNING: If you update the user info those changes will not be reflected here
  // To avoid this, reissue a token when you update user data
  res.send({ message: 'Secret message for logged in people ONLY!' })
})

module.exports = router
