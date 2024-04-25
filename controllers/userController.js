const UserAuth = require('../models/userModel');
const catchAsync=require('../utils/catchAsync');


const filterObj=(obj,...allowedFields)=>{
  Object.keys(obj).forEach((field)=>{
    if(!allowedFields.includes(field)){
       delete obj[field];
          }
  })
  return obj;
}
console.log(filterObj);

const authenticateUser=async (req,user,)=>{
    // 1) find the user from the collection
  const currentUser= await UserAuth.findById(user.id).select('+password');
  console.log(currentUser);

  // 2) ask user to enter the password
  const userPass=req.body.password;
  const passCheck=await currentUser.checkPassword(userPass,currentUser.password);

  // 3)check if password is correct 
       if(!passCheck){
         const err=new Error("please enter correct password");
         err.statusCode=401;
         return next(err);
       }

}

// getting all the users 
exports.getAllUsers = catchAsync(async(req, res) => {

  const getAllUsers=await UserAuth.find();
  res.status(200).json({
    status: "success",
    datas:getAllUsers
  });
});

// allow user to update his credentials
exports.updateMyData=catchAsync(async (req,res,next)=>{
  // note esma hamile kna next gareko vanda in this function we want id of currently logged user which we get through req.user which is passed in middleware and to get access to next middleware we need next() so 

  // 1) create error if user post password data
    if(req.body.password || req.body.confirmPassword){
      const err=new Error("here password modification is not allowerd please use route {{URL}}/api/v1/userAuth/updatePassword/ for it");
      err.statusCode=400;
      return next(err);
    }

  // 2) filter out the unwanted fields
  const filteredBody=filterObj(req.body,"name","email");
  console.log(filteredBody);

  // 3) update user document
//  here we dont want user to manipulate role ,resetToken etc so we only user only to manipulate particular field
        //  since it is not sensitive data like pass we can simply use findbyidandupdate() 
     const updatedUser= await UserAuth.findByIdAndUpdate((req.user.id),filteredBody,{
      new:true,
      runValidators:true
     });
  res.status(200).json({
    "status":"success",
    "message":"user data is updated successfully",
    "newUpdatedDocument":updatedUser
  })
})

// allow user to delete  account permanently

exports.deleteMyaccount=catchAsync(async(req,res,next)=>{

        authenticateUser(req,req.user);

  // 4)if correct delete account from db
   const deletedAccount=  await UserAuth.findByIdAndDelete(req.user.id);
     res.status(200).json({
        "status":"success",
        "message":"user account is deleted successfully",
        deletedAccount
      })
     })

    //  allow user to deactivate his account
    exports.deactivateMyAccount=catchAsync(async(req,res,next)=>{
    //  first authenticate user is real or not
      authenticateUser(req,req.user);
      // 2) update user status to false
      const updatedData= await UserAuth.findByIdAndUpdate(req.user.id,{userStatus:false});
        res.status(200).json({
          "status":"success",
          "message":"user account is deactivated successfully",
        })

    })


// this part is for admin who can manipulate all data

exports.getUser = catchAsync(async(req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
});
exports.createUser = catchAsync(async(req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
});


exports.updateUser = catchAsync(async(req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
});
exports.deleteUser = catchAsync(async(req, res) => {
  const deletedUser= await UserAuth.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: "success",
    message: "user is deleted successfully",
    deletedUser
  });
});
