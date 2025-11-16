const Listing = require('./models/listing');


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

module.exports.isOwner = async (req,res,next) => {
    let {id} = req.params; 
    let listing = await Listing.findById(id);  //Here is the logic if the owner is the curr user only then he can edit the listing.
    if (!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash('error',"You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

