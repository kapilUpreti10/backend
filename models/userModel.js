const mongoose=require('mongoose');
const validator=require('validator');
const bcrypt=require('bcryptjs');
const crypto=require('crypto');
const userAuthSchema=new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:[true,"please enter a name"],
        trim:true,
        maxlength:[30,"name cannot exceed more than 30 characters"],
        minlength:[3,"name cannot be less than 3 characters"],
        validate:[validator.isAlpha,"name cannot contain special characters and numbers"]
        
    },
    email:{
        type:String,
        required:[true,"please enter your email"],
        unique:[true,"email alread used"],
        lowercase:true,
        validate:[validator.isEmail,'please provide a valid email address']
    },
    photo:{
        type:String,
        trim:true,
    },
    role:{
        type:String,
        enum:['admin','user','manager']
    },
    password:{
        type:String,
        select:false,
        required:[true,"please enter your password"],
        unique:true,
        maxlength:[20,"password length cannot exceed 20 characters"],
        minlength:[8,"password should be at least of 8 characters"],
        //validate:[validator.isStrongPassword,{minlength:8,minUppercase:1,minNbrs:1,minSymbols:1},"weak password "]
    },
    confirmPassword:{
        type:String,
        required:true,
        validate:{
            validator:function(val){
                return val===this.password
            },
            message:"Please confirm your password as password is not same"
        }
    },
    changedPasswordAt:Date,
    passwordResetToken:String,
    passwordResetExpires:Date,
    userStatus:{
        type:Boolean,
        default:true,
        select:false
    }
})
  
// password encryption 
// it is done here because we always use concept of fat model thin controller ie we do lots of work in model and try to make contrller less complicated possible

userAuthSchema.pre('save',async function(next){
    //this means if we update document but if we dont update password then we dont have to hash it 
    if(! this.isModified('password')) return next();
    
    this.password=await bcrypt.hash(this.password,12);
    this.confirmPassword=undefined;
    next();
    
})

userAuthSchema.pre('save',async function(next){
    if(!this.isModified('password' || this.isNew)) return next();
    this.changedPasswordAt=Date.now()-1000;
})

// query middleware to show only data of user whose status is true

userAuthSchema.pre(/^find/,function(next){
    this.find({userStatus:{$ne:false}});
    // this.find() filters  out document before it is reached to ceratin function
    // for ex in findByIdAndUpdate() now if before there is 12 data and one data is deactivated now only 11 data will be filtered in that findByIdAndUpdate() query 
    next();
})


// you checkpassword yei banaunuparxa vanne xaina it is made here so that we can learn about methods and we donthave to import bcrypt and schema in authController
userAuthSchema.methods.checkPassword=async function(userPass,bcryptPass){
    return await bcrypt.compare(userPass,bcryptPass);
//     // here bcrypt.compare return promise so we should await it ie it is asycnhronous
}

userAuthSchema.methods.checkPasswordChanged = function(JWTtimestamp) {
    if (this.changedPasswordAt) {
        const changedTimestamp = parseInt(this.changedPasswordAt.getTime() / 1000, 10);
        return JWTtimestamp < changedTimestamp;
    }
    return false;
};

// forgot pass 
userAuthSchema.methods.createResetPassToken=function(){
    const resetToken=crypto.randomBytes(32).toString('hex');
    this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex');

    console.log({resetToken},this.passwordResetToken);
    // this mean reset token exppires at every 10 min and we do this for security resasons
    this.passwordResetExpires=Date.now()+10*60*1000;
         
    // here in email we want to send normal resetToken not encrypted one otherwise it will be difficult for user to enter
    return resetToken;
}

const UserAuth= mongoose.model("UserAuth",userAuthSchema,"userAuth");
module.exports=UserAuth;