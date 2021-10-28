const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // check if token not present
  if (!token) {
    return res.status(401).json({msg: "No token, authorization denied"});
  }

  try {
    const decoded = jwt.verify(token, config.get('secret'));

    req.user = decoded.user;  // pass the token Payload to the req
    next();
  } catch (error) {
    return res.status(401).json({msg: 'Token is not valid'});
  }
};