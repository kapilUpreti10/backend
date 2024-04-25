const express=require('express');
const router=express.Router();

const {getTour,getOverview}=require("../controllers/viewController");

router.get('/overview',getOverview);
router.get('/tour',getTour);

module.exports=router;