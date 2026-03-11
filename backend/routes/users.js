const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const UserUtils = require('../utils/supabase/userUtils');

// @route    POST api/users
// @desc     Create user (for signup flow - though Google auth is preferred)
// @access   Public
router.post(
  '/',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      const userUtils = new UserUtils(req.supabase);
      
      // Check if user already exists
      const existingUser = await userUtils.getUserByEmail(email);
      if (existingUser) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      // Hash password and create user
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await userUtils.createUser({
        name,
        email,
        password: hashedPassword,
        subscription: 'free',
        credits: 10
      });

      const payload = {
        user: {
          id: user.id
        }
      };

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'defaultSecret',
        { expiresIn: '5 days' }
      );

      res.json({ token });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;