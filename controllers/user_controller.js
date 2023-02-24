const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//register methoad-------------------------
const signup = async (req, res, next) => {
    //object destructuring
    const { name, email, password } = req.body;
    let existinguser;
    try {
        existinguser = await User.findOne({ email: email });
    } catch (error) {
        console.log(error);
    }
    if (existinguser) {
        return res.status(400).json({ message: "user already existing" })
    }
    const passwordhashed = bcrypt.hashSync(password);
    const user = new User({
        name,   //name : req.body.name,
        email,   //email : email,
        password: passwordhashed,  //password : password,
    });
    try {
        await user.save();
    } catch (error) {
        console.log(error)
    }
    return res.status(200).json({ message: "sucessfully register" })
}


//login methoad------------------>
const login = async (req, res, next) => {
    const { email, password } = req.body;
    let existinguser;
    try {
        existinguser = await User.findOne({ email: email });
    } catch (error) {
        console.log(error)
    }
    if (!existinguser) {
        return res.status(400).json({ message: "User not found Please signup " })
    }
    const passwordcorrect = bcrypt.compareSync(password, existinguser.password);
    if (!passwordcorrect) {
        return res.status(400).json({ message: "Invaild Email or Password" })
    }
    const token = jwt.sign({ id: existinguser._id }, process.env.jwtscretkey, { expiresIn: "35s", });
    if(req.cookies[`${existinguser._id}`]){
        req.cookies[`${existinguser._id}`]=""
    }

    res.cookie(String(existinguser._id), token, {
        path: "/",
        expires: new Date(Date.now() + 1000 * 30),
        httpOnly: true,
        samesite: "lax"
    });
    return res.status(200).json({ message: "Sucessfully Login In", user: existinguser, token });
};

const verifytoken = (req, res, next) => {
    const cookies = req.headers.cookie;
    const token = cookies.split("=")[1];
    console.log(token);
    // const header = req.headers[`authorization`];
    // const token = header.split(" ")[1];
    if (!token) {
        res.status(404).json({ message: "Token not found" })
    }
    jwt.verify(String(token), process.env.jwtscretkey, (error, user) => {
        if (error) {
            return res.status(400).json({ message: "Invaild Token" })
        }
        console.log(user.id);
        req.id = user.id;
    });
    next();
};

//Get methoad------------------>
const getuser = async (req, res, next) => {
    const userId = req.id;
    let user;
    try {
        user = await User.findById(userId, "-password");
    } catch (error) {
        return new Error(error)
    }
    if (!user) {
        return res.status(404).json({ message: "user not found" })
    }
    return res.status(200).json({ user })
};

const refreshToken = (req, res, next) => {
    const cookies = req.headers.cookie;
    const prevtoken = cookies.split("=")[1];
    if (!prevtoken) {
        return res.status(404).json({ message: "couldn't find token" })
    }
    jwt.verify(String(prevtoken), process.env.jwtscretkey, (error, user) => {
        if (error) {
            return res.status(403).json({ message: "authentication failed" })
        }
        res.clearCookie(`${user.id}`);
        req.cookies[`${user.id}`] = "";
        //generate new token
        const token = jwt.sign({ id: user.id }, process.env.jwtscretkey, { expiresIn: "35s", });
        res.cookie(String(user.id), token, {
            path: "/",
            expires: new Date(Date.now() + 1000 * 30),
            httpOnly: true,
            samesite: "lax"
        });
        //cookie generator
        req.id = user.id;
        next();
    });
}

const logout =(req,res,next)=>{
    const cookies = req.headers.cookie;
    const prevtoken = cookies.split("=")[1];
    if (!prevtoken) {
        return res.status(404).json({ message: "couldn't find token" })
    }
    jwt.verify(String(prevtoken), process.env.jwtscretkey, (error, user) => {
        if (error) {
            return res.status(403).json({ message: "authentication failed" })
        }
        res.clearCookie(`${user.id}`);
        req.cookies[`${user.id}`] = "";
        return res.status(200).json({message:"Successfully Logged Out"})
    });

}
exports.signup = signup;
exports.login = login;
exports.verifytoken = verifytoken;
exports.getuser = getuser;
exports.refreshToken = refreshToken;
exports.logout = logout;