module.exports.isLoggedIn = (req,res,next) => { //this is middleware we have created.
    if(!req.isAuthenticated()) {  //This isauthenticated is a inbuilt func of node, which basically says if the user is not authenticated then this logic will work.
        req.session.redirectUrl = req.originalUrl; //Saves the url which user was trying to visit.
        req.flash('error','You must be logged in to create listing');
        return res.redirect('/login');
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl) {                        //This is middleware we have created.
        res.locals.redirectUrl = req.session.redirectUrl;   //Because EJS templates can access variables only from locals.
    }
    next();
};