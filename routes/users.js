const express = require('express');
const router = express.Router();

// @route   POST api/users 
// @desc    Register a user
// @access  Public
router.post('/', (req, res) => {  // '/' same as api/users since using in its current file
  res.send('Register a user');
});

module.exports = router;