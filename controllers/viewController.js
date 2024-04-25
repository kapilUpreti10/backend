const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');

const getOverview=catchAsync(async(req,res)=>{
//  get all tour data from collection

const tours=await Tour.find();

// build template

// render the template using data from 1

    res.status(200).render('overview',{
        title:'All Tours',
        tours
        // this is tours is passing arg to pug file
    });
})
const getTour=catchAsync(async(req,res)=>{
res.status(200).render('tour');
})

module.exports={getOverview,getTour}