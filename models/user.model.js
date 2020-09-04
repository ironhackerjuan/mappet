const bcrypt = require('bcryptjs')
const { Schema, model } = require('mongoose')
const Pet = require('../models/pet.model')

const EMAIL_PATTERN = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i

const generateRandomToken = () => {
  const characters =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let token = ''
  for (let i = 0; i < 25; i++) {
    token += characters[Math.floor(Math.random() * characters.length)]
  }
  return token
}

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      minlength: [3, 'Name needs at last 3 chars'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [EMAIL_PATTERN, 'Email is invalid']
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      lowercase: true
    },
    avatar: {
      type: String
    },
    password: {
      type: String,
      minlength: [8, 'password min length is 8']
    },
    bio: {
      type: String,
      maxlength: 500
    },
    activation: {
      active: {
        type: Boolean,
        default: false
      },
      token: {
        type: String,
        default: generateRandomToken
      }
    },
    role: {
      type: String,
      enum: ['GUEST', 'ADMIN'],
      default: 'GUEST'
    },
    level: {
      type: String,
      enum: ['puppy', 'adult', 'senior'],
      default: 'puppy'
    },
    social: {
      google: String,
      facebook: String
    }
  },
  {
    timestamps: true
  }
)

userSchema.virtual('pets', {
  ref: 'Pet',
  localField: '_id',
  foreignField: 'creatorId',
  justOne: false
})

userSchema.methods.checkPassword = function (password) {
  return bcrypt.compare(password, this.password)
}

// userSchema.pre('save', function (next) {
//   if (this.isModified('password')) {
//     bcrypt.hash(this.password, 10).then((hash) => {
//       this.password = hash
//       next()
//     })
//   } else {
//     next()
//   }
// })

module.exports = model('User', userSchema)
