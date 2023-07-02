
const Messages = require("../model/message");
const express = require("express");
// const path = require ("path");
// const { upload } = require("../multer");
const router = express.Router();
const jwt = require("jsonwebtoken");




async function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    } else {
      reject(' không có token');
    }
  });

}

// get all messages with user id
router.get( "/get-all-messages/:id", async (req, res, next) => {
    try {

      const {userId} = req.params;
      const userData = await getUserDataFromRequest(req);
      const ourUserId = userData.userId;
      const messages = await Messages.find({
        sender:{$in:[userId,ourUserId]},
        recipient:{$in:[userId,ourUserId]},
      }).sort({createdAt: 1});


      res.status(201).json({
        success: true,
        messages,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message), 500);
    }
  })


module.exports = router;
