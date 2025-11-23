const User = require('../models/user');

module.exports.renderSignupForm = (req,res) => {  //This is the signup route we created.
    res.render('users/signup.ejs');
};

module.exports.userSignup = (async (req,res,next) => {       //post because we are sending the data
    try {
    let {username, email, password} = req.body;  //we are simply specifying what we are sending like email,username,password
    const newUser = new User ({email, username});  //creating a new user like how we created in the demouser
    const registeredUser = await User.register(newUser, password);  //using register inbuilt func who takes 2 parameters.
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
        if(err) {
         
           req.flash('error', 'Something went wrong while logging you in');  //using flasing to flash the msg.
           return res.redirect('/login');
        }
        req.flash('success', 'Welcome to Wanderlust');
        return res.redirect('/listings');                          //simple redirecting to listings.
    });
    } catch(e) {                     //here we are putting this in try catch to handle the error.
        req.flash('error', e.message); //if error occurs then we have used flash
        return res.redirect('/signup');
    }
});



module.exports.renderLoginForm = (req,res) => {  //Created a new route for login
    res.render('users/login.ejs'); 
};

module.exports.userLogin = async (req,res) => {
        req.flash('success','Welcome back to Wanderlust');  //if logged in then flash this msg
        let redirectUrl = res.locals.redirectUrl || '/listings'; //Check gpt.
        res.redirect(redirectUrl);   //and simply redirect.

};



module.exports.userLogout = (req,res,next) => {  //we have created a logout route here,
    req.logout((err) => {   //This is a inbuilt func of node which by default takes a callback in the parameter.callback means immediately what we are suppose to do after logout. and here we are passing err.
        if (err) {
            return next(err);
        }
        req.flash('success', 'You are logged out');
        res.redirect('/listings');
    });

};