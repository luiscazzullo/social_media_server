module.exports.validateRegisterInput = (
  username,
  email,
  password,
  confirmPassword
) => {
  const errors = {};
  if(username.trim() === '') {
    errors.username = 'El nombre de usuario no puede permanecer vacío';
  }
  if (email.trim() === '') {
    errors.email = 'El email del usuario no puede permanecer vacío';
  } else {
    const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
    if(!email.match(regEx)) {
      errors.email = 'El email no es correcto'
    }
  }
  if(password === '') {
    errors.password = 'El password no debe viajar vacío'
  } else if(password !== confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no son iguales'
  }

  return {
    errors,
    valid: Object.keys(errors).length < 1
  }
}

module.exports.validateLoginInput = (username, password) => {
  const errors = {};
  if (username.trim() === '') {
    errors.username = 'El nombre de usuario no puede enviarse vacío';
  }
  if (password.trim() === '') {
    errors.password = 'La contraseña no puede enviarse vacía';
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1
  }
}