const UserAuth = require('../models/userModel');
const catchAsync=require('../utils/catchAsync');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const {promisify}=require('util');
const sendEmail=require('../utils/email');
const crypto=require('crypto');

// creating jwtToken
const signToken= (id)=>{
    return jwt.sign({id:id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRE_DATE})
}
// sending jwtToken as response

const sendToken=(user,statusCode,res)=>{
    const jwtToken= signToken(user._id);
    user.password=undefined;

    // sending jwttoken as cookie instead of response as json

    const cookieOptions={
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE_DATE*24*60*60*1000),
        httpOnly:true
       
    }
    if(process.env.NODE_ENV=="production") cookieOptions.secure=true;
    res.cookie("jwt",jwtToken,cookieOptions);
   // console.log("Cookie set:", res.getHeaders()["set-cookie"]);
    // remove password from output while creating account for first time
    
    // note cookies should be send before response 
        res.status(200).json({
        "status":"success",
        "token":jwtToken,
         user
    })

}

// checking password

// const checkPassword= catchAsync(async(loginPass,bcryptPass)=>{
//     return await bcrypt.compare(loginPass,bcryptPass);
// })

const signUp= catchAsync(async(req,res)=>{
  //  const userData= await userAuth.create(req.body);
//   in this code there is security flaw as any can create as id as admin 

const userData=await UserAuth.create({
    name:req.body.name,
    email:req.body.email,
    role:req.body.role,
    password:req.body.password,
    confirmPassword:req.body.confirmPassword
// the difference in two code is that in above code we if we insert photo then it will be saved in db but here is we enter photo also it will not be accepted or saved so .. using this concept if some user make role as admin also for new user we will not store that 
// to create admin role one who have access to db can go to compass and create from there as user dont have access to db 

})
// we can also create jwt secret using crypto
// const jwtToken= signToken(userData._id);
//     res.status(200).json({
//         "status":"success",
//         "token":jwtToken,
//          userData
//     })
       sendToken(userData,200,res);
    })
const login=catchAsync(async(req,res,next)=>{
 
    const {email,password}=req.body;
   // console.log(email,password);
    // check if user provides both email and password
    if(!email || !password ){
        const err=new Error("please provide email and password");
      err.statusCode=400;
      err.status='failed'
       return next(err);  //here dont forget to write return otherwise below it will also be exectued
        // if we forget to return then two response will be send so it will give message cannot set headers after response is send to client
    }
    // check if user exists and password is correct
    const user = await UserAuth.findOne({email:email}).select('+password');
    // since we hide password using select false in schema so that it wont show durnig get request but now here we require password for this we need to select it with + sign which indicates this feild was hidden and shows only here
    // if select false gareko xaina vane yo .select wala jhamela nai hunna 
   
   // console.log(user);
   if(!user || !(await user.checkPassword(password,user.password))){
    const err=new Error("invalid email or password");
    // here invalid email or pass is shown so that sometimes hacker may try to randomly guess pass so for such case they dont either email or pass is incorrect
    err.statusCode=401;
    return next(err);
   }
//    sending back jwt token
   sendToken(user,200,res);
})

const protect=catchAsync(async(req,res,next)=>{
    // getting token and check if there is token 

    let token ;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token=req.headers.authorization.split(' ')[1];
    }
    if(!token){
        const err=new Error("you are not logged in please login to get access");
       err.statusCode=401;
        err.status="failed";
        return next(err);
    }

    // verify token 

    // const decoded =await promisify(jwt.verify)(token,process.env.JWT_SECRET);
    let decoded;
 const promiseCallback= promisify(jwt.verify);
 try{
 decoded= await promiseCallback(token,process.env.JWT_SECRET);
 console.log("token verified successfully");
 }catch(err){
    console.log("failed to verify token");
 }
//  we cannot do this as we cannot  mix promise and await as async await is another simple way to handle promise instead we can use try catch if we really wnat to show teh below result
// .then(res=> console.log("token is verified successfully"))
// .catch(err=> console.log("failed to verify token"));
 console.log(decoded);

//  check if user still exists ie id is deleted or not 

const freshUser= await UserAuth.findById(decoded.id);
if(!freshUser){
    const err=new Error("user belonging to this token doesnot exists");
    err.statusCode=401;
    err.status="failed"
   return next(err);
}

// check if password is changed or not 
if(freshUser.checkPasswordChanged(decoded.iat)){
    const err=new Error("password is changed please login again");
    err.statusCode=401;
    err.status="failed"
    return next(err);
}
// grant access to protected route
console.log(freshUser);
req.user=freshUser;
next();
})
const restrictRouteTo=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            const err=new Error("you dont have permission to perform this acttion");
            err.statusCode=401;
            return next(err);
        }
        next();
    }

}

const forgotPassword=catchAsync(async(req,res,next)=>{
    // get user based on posted email
const  user= await UserAuth.findOne({email:req.body.email});
//  check if user has exist or not
  if(!user){
    const err=new Error("no user is found with this email");
    err.statusCode=404;
    return next(err);
  }
//   generate random token not json web token 

const resetToken=user.createResetPassToken();
    //  this is done to save the  modified document in database
       await user.save({validateBeforeSave:false});
    //    validator before save le k garxa vane maile schemama jun jun field required vanerw mark garkeo the aba tyo validation word nagaros just only just before saving the document

// sending token to usersEmail

const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
const message = `Forgot your password? Submit a patch request with your new password and confirmPassword to ${resetURL}.\n If you didn't forget your password, please ignore this email.`;

try {
  // Send the email
  await sendEmail({
    email: user.email,
    subject: 'Your password reset token is valid for 10 minutes',
    message,
  });
  res.status(200).json({
    status: 'success',
    message: 'Token sent to email',
  });
} catch (error) {
  // Log the error for debugging
  console.error('Error sending email:', error);

  // Clear token and expiration in case of an error
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  
  // Save the user document with the cleared token and expiration
  await user.save({ validateBeforeSave: false });

  // Send an error response
  const err = new Error('There was an error sending the email. Please try again later.');
  err.statusCode = 500;
  return next(err);
}
})
const resetPassword=catchAsync(async(req,res,next)=>{

    // find user based on token 
    const hashedToken=await crypto.createHash('sha256').update(req.params.token).digest('hex');
      
    // finding user based on this hashedtoken
    // here we compare the encrypted form of reset token which is stored in db with the reset token sent back by converting again into hash form 

    const user=await UserAuth.findOne({passwordResetToken:hashedToken, passwordResetExpires:{$gt:Date.now()}});

    // checking user exist or token is expird or not

    if(!user){
        const err=new Error("token is invalid or expired");
        err.statusCode=400;
        return next(err);
    }

    // update changePassAt property
    //  done in userModel 
   
    // login the user and send back new jwt based on new pass

     user.password=req.body.password;
     user.confirmPassword=req.body.confirmPassword;
     user.passwordResetToken=undefined;
     user.passwordResetExpires=undefined;

     await user.save();

    //  sending token 
         sendToken(user,200,res);
        })
const updatePassword=catchAsync(async (req,res,next)=>{
    // get user from collection
   
    const user= await UserAuth.findById(req.user.id).select("+password");
     console.log(user);
       if(!user){
        let err=new Error("user doesnot exists");
        err.statusCode=404;
        return next(err);
           }
    // ask user to enter current password 
    // note: schema define navako field db ma store garne bela ma matra ignore hune ho but we can access it here
    const userPass=req.body.currentPassword;

    // check if user has provided pass or not and check it is correct or not

    if(!userPass || !(await user.checkPassword(userPass,user.password))){
        let err=new Error("please enter the correct password");
        err.statusCode=401;
        return next(err);
    }

    // update password 
     user.password=req.body.password;
     user.confirmPassword=req.body.confirmPassword;
     await user.save();

    //  send new jwtToken
      sendToken(user,200,res);



})
module.exports={signUp,login,protect,restrictRouteTo,forgotPassword,resetPassword,updatePassword};