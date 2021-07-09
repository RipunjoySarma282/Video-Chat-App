const mongoose=require('mongoose');
const validator=require('validator');
const isEmail=validator.isEmail;
const bcrypt=require('bcrypt');

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Please enter an email"],
        lowecase:true,
        unique:true,
        validate:[isEmail,"Please enter an valid email"]
    },
    username:{
        type:String,
        required:[true,"Please enter the username"],
    },
    password:{
        type:String,
        required:[true,"Please enter an password"],
        minlength:[7,"Minimum password length is 7 characters"]

    },
},
{
    timestamps:true,
});

// hash the password before saving to the db
userSchema.pre('save', async function(next){
    const salt=await bcrypt.genSalt();
    this.password=await bcrypt.hash(this.password,salt);
    next();
})

// static method to login user
userSchema.statics.login=async function(email,password){
    const user=await this.findOne({email:email});
    if(user)
        {
            const auth=await bcrypt.compare(password,user.password);
            if(auth)
                {
                    return user;
                }
            throw Error('incorrect password');
        }
    throw Error('incorrect email');
};


const User=mongoose.model('user',userSchema);
module.exports=User;