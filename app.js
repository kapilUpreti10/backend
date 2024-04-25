const express = require("express");
const app = express();
const morgan = require("morgan");
const rateLimit=require('express-rate-limit');
const helmet=require('helmet');
const xss=require('xss-clean');
const mongoSanitize=require('express-mongo-sanitize');
const hpp=require('hpp');
const path=require('path');

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const userAuthRouter = require("./routes/userAuthRoute");
const practiseViewRouter=require('./routes/practiseViewRoute');
const viewRouter=require('./routes/viewRoute');
const globalErrorHandler=require('./utils/errorHandler');

// 1) MIDDLEWARES
// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }

// global middleware ie it always runs 
// set security http headers
app.use(helmet());

// set security for nosql query injection
app.use(mongoSanitize());

// set security for xss
app.use(xss());

// prevent parameter pollution
app.use(hpp());

// body parser 
app.use(express.json());
// app.use(express.json({limit:'10kb'}));
// this only parse the data that is less than 10kb
// serve static files
//app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));


// setting up view engine
app.set('view engine','pug');
// app.set('view engine','ejs');
// app.set("views",path.join(__dirname,'practiseViews'));
app.set("views",path.join(__dirname,'views'));

// test middlewares
app.use((req, res, next) => {
  console.log("Hello from the middleware 👋");
  next();
});


app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers);
  next();
});

const limiter=rateLimit({
  max:100,
  windowMs:60*60*1000,
  message:'too many request from this ip please try again in an hour'
})
app.use('/api',limiter); //this means this limiter will only work for all route starting with /api 
// 3) ROUTES

app.use('/',practiseViewRouter);
app.use('/',viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use('/api/v1/userAuth',userAuthRouter)
app.all('*',(req,res,next)=>{
  const err=new Error(`cannot get ${req.originalUrl} route`);
  err.statusCode=404;
  err.status="failed";
  next(err);
})

// all error will be handler by global error handler at last
// app aaune bitikai harek route run huda rw harek middleware run huda yo run hunxa so it can handle error occurring at every palce and request response cycle 
app.use(globalErrorHandler);

// global error handler

module.exports = app;
