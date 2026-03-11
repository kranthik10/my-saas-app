const jwt = require('jsonwebtoken');

module.exports = async function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultSecret');
    req.user = decoded.user;
    
    // Verify user still exists in Supabase
    const { data: user, error } = await req.supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();
      
    if (error || !user) {
      return res.status(401).json({ msg: 'User no longer exists' });
    }
    
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};