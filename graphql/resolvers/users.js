const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const { UserInputError } = require('apollo-server')
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../../config');
const { validateRegisterInput, validateLoginInput } = require('../../utils/validators')

function generateToken(user) {
  return jwt.sign({
    id: user.id,
    email: user.email,
    username: user.username
  }, SECRET_KEY, { expiresIn: '24h' })
}

module.exports = {
  Mutation: {
    login: async (_, { username, password }) => {
      const {errors, valid } = validateLoginInput(username, password);
      if(!valid) {
        throw new UserInputError('Errors', { errors });
      }
      const user = await User.findOne({ username });
      if(!user) {
        errors.general = 'Usuario no encontrado'
        throw new UserInputError('Usuario no encontrado', { errors });
      }
      const match = await bcrypt.compare(password, user.password);
      if(!match) {
        errors.general = 'Credenciales incorrectas'
        throw new UserInputError('Credenciales incorrectas', { errors });
      }
      const token = generateToken(user);
      return {
        ...user._doc,
        id: user._id,
        token
      }
    },
    register: async (_, { registerInput: { username, email, password, confirmPassword }}, context, info) => {
      try {
        const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword);
        if(!valid) {
          throw new UserInputError('Errors', {
            errors
          })
        }
        password = await bcrypt.hash(password, 12);
        const user = await User.findOne({ username });
        if(user) {
          throw new UserInputError('El nombre de usuario ya está tomado', {
            errors: {
              username: 'El nombre de usuario ya está usado'
            }
          })
        }
        const newUser = new User({
          email,
          username,
          password,
          createdAt: new Date().toISOString()
        })
        const result = await newUser.save();
        const token = generateToken(result);
        return {
          ...result._doc,
          id: result._id,
          token
        }
      } catch (error) {
        throw new Error(error)
      }
    }
  }
}