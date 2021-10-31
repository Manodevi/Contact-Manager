const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const Contact = require('../models/Contact');

// @route   GET api/contacts 
// @desc    Get all users contacts
// @access  Private
router.get('/', auth, 
    async (req, res) => {
      try {
        // get contacts list by user id and sort it by date recent
        const contacts = await Contact.find({ user: req.user.id}).sort({date: -1});
        res.json(contacts);
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    }
);

// @route   POST api/contacts 
// @desc    Add new contact
// @access  Private
router.post('/', 
      [
        auth, 
        [check('name', 'Name is required').not().isEmpty(),
        check('email', 'Enter a valid email').isEmail()]
      ],
      async (req, res) => {
        try {
          // Validation of post values
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
          }

          // get values from request body
          const { name, email, phone, type } = req.body;

          // new model Contact instance
          const newContact = new Contact({
            name, email, phone, type, user: req.user.id
          });

          // save to DB and send back to user
          const contact = await newContact.save();
          res.json(contact);
        } catch (error) {
          console.error(error.message);
          res.status(500).send('Server Error');
        }
      }
);


// @route   PUT api/contacts/:id
// @desc    Update contact
// @access  Private
router.put('/:id', (req, res) => {
  res.send('Update contact');
});

// @route   DELETE api/contacts/:id
// @desc    Delete contact
// @access  Private
router.delete('/:id', (req, res) => {
  res.send('Delete contact');
});

module.exports = router;