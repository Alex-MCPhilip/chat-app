
const express = require("express");
const User = require("../model/user");
const router = express.Router();
// const { upload } = require("../multer");
// const fs = require("fs");// dùng để thao tác file với hệ thống
const jwt = require("jsonwebtoken");


// Đăng kí người dùng
router.post("/create-user", async (req, res ) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra xem tài khoản đã tồn tại hay chưa
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Tài khoản đã tồn tại' });
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();


    jwt.sign({userId:createdUser._id,username}, jwtSecret, {}, (err, token) => {
      if (err) throw err;
      res.cookie('token', token, {sameSite:'none', secure:true}).status(201).json({
        id: createdUser._id,
      });
    });

    res.status(201).json({ message: 'Đăng kí thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Đã xảy ra lỗi' });
  }
})

// Đăng nhập người dùng
router.post("/login-user" , async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Tìm người dùng trong cơ sở dữ liệu
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác' });
    }

    // So sánh mật khẩu
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không chính xác' });
    }


    jwt.sign({userId:user._id,username}, jwtSecret, {}, (err, token) => {
      res.cookie('token', token, {sameSite:'none', secure:true}).json({
        id: foundUser._id,
      })
    })


    res.status(200).json({ message: 'Đăng nhập thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Đã xảy ra lỗi' });
  }
})



// Đăng xuất người dùng
router.get( "/logout" , async (req, res ) => {

  res.cookie('token', '', {sameSite:'none', secure:true}).json('ok');

  // Xử lý logic đăng xuất
  res.status(200).json({ message: 'Đăng xuất thành công' });
})


router.get( "/people" , async (req, res ) => {
  const users = await User.find({}, {'_id':1,username:1});
  res.json(users);
});


router.get( "/profile" , async (req, res ) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) throw err;
      res.json(userData);
    });
  } else {
    res.status(401).json(' không có token');
  }
});



module.exports = router;