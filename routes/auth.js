const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET api/auth 
// @desc    Get logged in user
// @access  Private
router.get(
      '/', 
      auth, 
      async (req, res) => {
        try {
          // get user details except password from DB
          const user = await User.findById(req.user.id).select("-password");
          res.json(user);
        } catch (error) {
          console.error(error.message);
          res.status(500).send("Server Error");
        }
      }
);


// @route   POST api/auth 
// @desc    Auth user & get token
// @access  Public
router.post(
    '/',
    [
      check('email', 'Please include a valid email').isEmail(),
      check('password', 'Password is required').exists()
    ],
    async (req, res) => {  // '/' same as api/auth since using in its current file
      const errors = validationResult(req);
      if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()} );
      }      

      const { email, password } = req.body;

      try {
        let user = await User.findOne({ email });

        // check for user presence
        if(!user) {
          return res.status(400).json({ msg: "Invalid Credentials"});
        }

        // compare plain password with hash password in DB
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
          return res.status(400).json({ msg: "Invalid Credentials"});
        }

        // Create Json Web Token

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
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    }
  );

module.exports = router;