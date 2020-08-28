// routes/auth.routes.js
const bcryptjs = require('bcryptjs')
const saltRounds = 10
const User = require('../models/user.model')
const mongoose = require('mongoose')
const nodemailer = require('../config/mailer.config')

module.exports.getLogin = (req, res, next) => {
  if (req.session.currentUser) {
    res.redirect('/')
  } else {
    res.render('auth/login', {
      title: 'Log in here',
      message: 'Please check your mail to activate your account',
      category: 'login'
    })
  }
}

module.exports.postLogin = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        user.checkPassword(req.body.password).then((match) => {
          if (match) {
            if (user.activation.active && user.role === 'ADMIN') {
              req.session.currentUser = user
              res.redirect('/admin')
            } else if (user.activation.active) {
              req.session.currentUser = user
              res.redirect('/')
            } else {
              res.render('auth/login', {
                error: {
                  validation: {
                    message: 'Your account is not active, check your email!'
                  }
                }
              })
            }
          } else {
            res.render('auth/login', {
              error: {
                email: {
                  message: 'user not found'
                }
              }
            })
          }
        })
      } else {
        res.render('auth/login', {
          error: {
            email: {
              message: 'user not found'
            }
          }
        })
      }
    })
    .catch(next)
}

module.exports.getRegister = (req, res, next) => {
  res.render('auth/register', { title: 'Register here', category: 'register' })
}

module.exports.postRegister = (req, res, next) => {
  const { username, email, avatar, password } = req.body
  if (!username || !email || !password) {
    res.render('auth/register', {
      errorMessage:
        'All fields are mandatory. Please provide your username, email, avatar and password.'
    })
    return
  }
  // make sure passwords are strong:
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/
  if (!regex.test(password)) {
    res.status(500).render('auth/register', {
      errorMessage:
        'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.'
    })
    return
  }
  bcryptjs
    .genSalt(saltRounds)
    .then((salt) => bcryptjs.hash(password, salt))
    .then((hashedPassword) => {
      const userParams = req.body
      userParams.avatar = req.file ? req.file.filename : undefined

      return User.create({
        name: userParams.name,
        username,
        email,
        avatar: `${process.env.CLOUDINARY_SECURE}/${userParams.avatar}`,
        password: hashedPassword,
        bio: userParams.bio
      })
    })
    .then((user) => {
      nodemailer.sendValidationEmail(
        user.email,
        user.activation.token,
        user.name
      )
      res.render('auth/login', {
        message: 'Check your email for activation'
      })
    })
    .then((userFromDB) => {
      console.log('Newly created user is: ', userFromDB)
      res.redirect('/login')
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(500).render('auth/register', { errorMessage: error.message })
      } else if (error.code === 11000) {
        res.status(500).render('auth/register', {
          errorMessage:
            'Username and email need to be unique. Either username or email is already used.'
        })
      } else {
        next(error)
      }
    })
}

module.exports.getToken = (req, res, next) => {
  User.findOne({ 'activation.token': req.params.token })
    .then((user) => {
      if (user) {
        user.activation.active = true
        user
          .save()
          .then((user) => {
            res.render('auth/login', {
              message: 'Your account has been activated, log in below!'
            })
          })
          .catch((e) => next)
      } else {
        res.render('auth/login', {
          error: {
            validation: {
              message: 'Invalid link'
            }
          }
        })
      }
    })
    .catch((e) => next)
}

module.exports.doLogout = (req, res, next) => {
  req.session.destroy()
  res.redirect('/')
}
