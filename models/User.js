const mongoose = require("mongoose");

const schema = mongoose.Schema;

const userschema = new schema({
    name:{
        type : String,
        require : true
    },
    email:{
        type : String,
        required: [true, "Please provide an Email!"],
        unique: [true, "Email Exist"],
    },
    password:{
        type: String,
        required: [true, "Please provide a password!"],
        minlength : 6
    }

})

module.exports = mongoose.model("User", userschema)