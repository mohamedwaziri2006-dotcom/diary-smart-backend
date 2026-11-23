const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Hakuna token, ruhusa imekataliwa' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  if (!token) {
    return res.status(401).json({ message: 'Fomati ya token si sahihi' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Inatoa ID ya mtumiaji
    next();
  } catch (err) {
    res.status(403).json({ message: 'Token si sahihi au imeisha muda wake' });
  }
};

module.exports = verifyToken;