const Tour = require("./../models/tourModel");
const catchAsync=require('../utils/catchAsync');

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: "fail",
      message: "Missing name or price",
    });
  }
  next();
};



exports.getAllTours =catchAsync(async (req, res) => {
// console.log(req.requestTime);
 const tours= await Tour.find({}).sort({id:1});
  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    results: tours.length,
      tours,
    });
});

exports.getTour = catchAsync(async(req, res) => {
  console.log(req.params);
  const id = req.params.id * 1;

  const tour =await Tour.find((el) => el.id === id);

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res) => {
  // console.log(req.body);
    const addTour = await Tour.create(req.body);

    res.status(200).json({
      status: "success",
      message:
        "successfully data is enterd in database using postman and post method",
    });
});

exports.updateTour = catchAsync(async(req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      tour: "<Updated tour here...>",
    },
  });
});

exports.deleteTour =catchAsync(async (req, res) => {
  res.status(204).json({
    status: "success",
    data: null,
  });
});
