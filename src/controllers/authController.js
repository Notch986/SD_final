const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { name, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ name, username, password: hashedPassword });
    
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, user: { name: user.name } });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  register,
  login,
};
