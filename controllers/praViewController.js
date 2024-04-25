const catchAsync = require("../utils/catchAsync");

const getTour=(req,res)=>{
res.status(200).render('tour',{doc_title:'tour page'});
}

const getUser=(req,res)=>{
  res.status(200).render('user',{doc_title:'user page'});
}

const getOverview=(req,res)=>{
  res.status(200).render('base');
}

module.exports={getTour,getUser,getOverview}