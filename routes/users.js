const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
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
        return res.status(400).json({ msg: "User already exists"}); // status 400: bad request
      }
 
      user = new User({ name, email, password }); // it doesn't saved in DB, just created an instance
      
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt); // hash version of the password
      await user.save();

      res.send('user saved');
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
    
});

module.exports = router;