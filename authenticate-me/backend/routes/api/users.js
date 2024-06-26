const express =require('express');
const router =  express.Router();
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

// Validation middleware
const validateSignUp = [
  check('email').exists({values: 'falsy'}).isEmail().withMessage('Please provide a valid email.'),
  check('username').exists({values: 'falsy'}).isLength({min: 4}).withMessage('Please provide a username with at least 4 characters.'),
  check('username').not().isEmail().withMessage('Username cannot be an email'),
  check('password').exists({values: 'falsy'}).isLength({min: 6}).withMessage('Password must be 6 characters or more'),
  handleValidationErrors
];


// Signup route
router.post("/", validateSignUp, async (req, res) => {
  const { email, password, username } = req.body;
  const user = await User.signup({ email, username, password });

  await setTokenCookie(res, user);

  return res.json({
    user,
  });
});








module.exports = router;