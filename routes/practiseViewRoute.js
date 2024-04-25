const express=require('express');
const router=express.Router();
const {getTour,getUser,getOverview}=require("../controllers/praViewController");

router.get('/tour',getTour);
router.get('/user',getUser);
router.get('/',getOverview);


module.exports=router;