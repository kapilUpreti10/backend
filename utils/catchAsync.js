const catchAsync=fn=>{
  return (req,res,next)=>{
// here return is done to return the value after function is either resolved or rejected and (req,res,next) is done to pass arg to fn function 
    fn(req,res,next).catch(err=>next(err));
  }
}
module.exports=catchAsync;