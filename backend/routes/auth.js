const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const UserUtils = require('../utils/supabase/userUtils');

// @route    GET api/auth
// @desc     Get user by token (when already authenticated via Supabase)
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const userUtils = new UserUtils(req.supabase);
    const user = await userUtils.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Return user info without sensitive data
    const { id, email, name, subscription, credits, created_at } = user;
    res.json({ id, email, name, subscription, credits, created_at });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/auth/login-with-token
// @desc     Login using Supabase session token (for client-side auth)
// @access   Public
router.post('/login-with-token', async (req, res) => {
  try {
    // This would be used when the frontend handles authentication via Supabase client
    // For now, we'll return a placeholder
    res.json({ msg: 'Login with token endpoint' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;