const express = require('express');
const router = express.Router();
const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');


// Validate middleware
const validateLogin = [
  check("credential")
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Please provide a valid email or username."),
  check("password")
    .exists({ values: "falsy" })
    .withMessage("Please provide a password."),
  handleValidationErrors,
];

//  get session user
router.get('/', restoreUser, (req, res) =>{
    const { user } = req;

    if(user){
        return res.json({
            user: user.toSafeObject()
        });
    }else{
        return res.json({});
    }
});


//login route
router.post('/', validateLogin, async (req, res, next) =>{
    const {credential, password } = req.body;
    console.log("I'M HIT")
    const user = await User.login({ credential, password});

    if(!user){
        const err =  new Error('Login Failed!');
        err.status = 401;
        err.title = 'Login Failed';
        err.errors = ['The provided credentials were invalid'];
        return next(err);
    }

    await setTokenCookie(res, user);

    return res.json({
        user
    });
});

// logout route
router.delete('/', (_req, res) =>{
    res.clearCookie('token');
    return res.json({message: 'success'});
});







module.exports = router;