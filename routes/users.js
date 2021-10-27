const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/User');

// @route   POST api/users 
// @desc    Register a user
// @access  Public
router.post(
  '/',
  [
    check('name', 'Name is required')
      .not().isEmpty(),   // not empty
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters')
      .isLength({min: 6})
  ],
  async (req, res) => {  // '/' same as api/users since using in its current file
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return  res.status(400).json({errors: errors.array()});
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if(user) {
        // status 400: bad request
        return res.status(400).json({ msg: "User already exists"});
      }
 
      // it doesn't saved in DB, just created an instance
      user = new User({ name, email, password });
      
      // hash version of the password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      
      // save in DB
      await user.save();

      // Create JSON Web Token

      // Payload with user id
      const payLoad = {
        user: {
          id: user.id
        }
      };

      // sign in jwt with - payload, secret, expiresIn 1 hour, callback fn to send the token to the user
      jwt.sign(
        payLoad,
        config.get('jwtSecret'),
        {
          expiresIn: 3600
        },
        (err, token) => {
          if(err) throw err;
          res.json({ token });
        }
      );

    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
    
});

module.exports = router;