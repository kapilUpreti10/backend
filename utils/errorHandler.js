// handling error on basis of name 
const handleJWTError=()=>{
  const err=new Error("invalid token please login again");
  err.statusCode=401;
  err.status="failed to login";
  return err;
  
}
const TokenExpiredError=()=>{
  
}


const globalErrorHandler= (err,req,res,next)=>{
  const statusCode=err.statusCode || 500;
  const status=err.status || "failed";
  const message= err.message || "internal server error";
  const stack=err.stack || "unknow error"
  const name=err.name;

  if(process.env.NODE_ENV=="development"){

      res.status(statusCode).json({
          status,
          statusCode,
          name,
          message,
          stack
      })
    }
    else if(process.env.NODE_ENV=="production"){
      if (err.name === 'JsonWebTokenError') err = handleJWTError();
       
         const statusCode=err.statusCode || 500;
        const status=err.status || "failed";
        const message= err.message || "internal server error";


              // sending final user freindly response 
        res.status(statusCode).json({
            status,
            message
        })
  }

}
module.exports=globalErrorHandler;