const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

 const registerUser = async (req, res) => {
  try {
    const { firstname, lastname, email, mobile, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstname,
      lastname,
      email,
      mobile,
      password: hashedPassword
    });

    res.status(201).json({
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      mobile: user.mobile
    });
  } catch (error) {
    console.error("Error in registerUser:", error); 

    res.status(500).json({ message: error.message });
  }
};

module.exports = {registerUser};