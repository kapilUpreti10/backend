const {signUp,login,forgotPassword,resetPassword,updatePassword,protect}=require("../controllers/authController");
const express=require('express');

const router=express.Router();


router.route('/signup').post(signUp);
router.route('/login').post(login);

router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:token').patch(resetPassword);


router.route('/updatePassword').patch(protect,updatePassword);

module.exports=router;