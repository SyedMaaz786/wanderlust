const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const { listingSchema, reviewSchema } = require('./schema.js'); //importing validation schema which we defined in schema.js
const Review = require('./models/review.js');
const session = require('express-session');
const flash = require('connect-flash');
const passportLocalMongoose = require('passport-local-mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const {isLoggedIn, isOwner} = require('./middleware.js');  //created the middleware.js and required here
const { saveRedirectUrl } = require('./middleware.js'); //same as above



const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
main()
.then( () => {
    console.log('Connected to DB');   //Here we are just setting the mongoose server
})
.catch( (err) => {
    console.log(err)
});
async function main() {
    await mongoose.connect(MONGO_URL)
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, '/public')));   // (app.use) This is how you use middleware in Express. (express.static) This is the middleware built-in function.(path.join) This part is crucial for creating a path.(__dirname) This is a global variable in Node.js that gives you the absolute path of the directory.(public) This is the name of the folder you want to serve.

const sessionOptions = {         //Here we are using session. Which is basically used to store the user info on the server for sometime. 
    secret: 'mysupersecretcode',  //This is the basic way to write the session.
    resave: false,                //Don’t save the session to the store if nothing has changed in the session.
    saveUninitialized: true,       //Save a session even if it is new and not modified.
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,  //This is the logic we are writing that the cookie shold expire after 1 week.
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,   //This is to protect cookie from malicious xss attacks.
    },
};

app.get('/', (req,res) => {
    res.send('Hi, i am root');
});

app.use(session(sessionOptions));  //This activates the session middleware.
app.use(flash());  //This activates the flash middleware.


app.use(passport.initialize());  //This is how you use the passport by 1st initializing.
app.use(passport.session());     //Here we have created a middleware with session.
passport.use(new LocalStrategy(User.authenticate()));  
passport.serializeUser(User.serializeUser());   //Here this is the compulsory way of how we setup the passport check gpt for better understanding.
passport.deserializeUser(User.deserializeUser());


app.use( (req,res,next) => {
    res.locals.success = req.flash('success'); //This is the middleware for flash.
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user;  //Anything stored in res.locals is available Only for the current request–response cycle.
    next();
});

// app.get('/demouser', async (req, res) => {  //This is the demo route we are creating for our fake user 
//     let fakeuser = new User({               
//         email: 'Syed@gmail.com',
//         username: 'Syed'
//     });
//     let registereduser = await User.register(fakeuser, 'helloworld');  //This register method will save our fakeuser data with the password in the database.
//     res.send(registereduser);                                          //Here we are assigning to a variable called registerduser and in res.send (sending it)
// });                                                                   //So basically register is the inbuilt method in node. 



//User signup code
app.get('/signup', (req,res) => {  //This is the signup route we created.
    res.render('users/signup.ejs');
});
app.post('/signup', wrapAsync(async (req,res) => {       //post because we are sending the data
    try {
    let {username, email, password} = req.body;  //we are simply specifying what we are sending like email,username,password
    const newUser = new User ({email, username});  //creating a new user like how we created in the demouser
    const registeredUser = await User.register(newUser, password);  //using register inbuilt func who takes 2 parameters.
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
        if(err) {
            return next(err);
        }
        req.flash('success', 'Welcome to Wanderlust');  //using flasing to flash the msg.
        res.redirect('/listings');                          //simple redirecting to listings.
    });
    } catch(e) {                     //here we are putting this in try catch to handle the error.
        req.flash('error', e.message); //if error occurs then we have used flash
        res.redirect('/signup');
    }
})
);

//User login code
app.get('/login', (req,res) => {  //Created a new route for login
    res.render('users/login.ejs'); 
});
app.post('/login', saveRedirectUrl,           //post because we are sending the user data to send or store the data we use post method savedredirecturl is the midddleware we created in middleware.js we are implementing here.
    passport.authenticate('local', {failureRedirect: '/login', failureFlash:true}),  //This full line is the inbuilt func of node check gpt for more info.
    async (req,res) => {
        req.flash('success','Welcome back to Wanderlust');  //if logged in then flash this msg
        let redirectUrl = res.locals.redirectUrl || '/listings'; //Check gpt.
        res.redirect(redirectUrl);   //and simply redirect.

});

//User logout

app.get('/logout', (req,res,next) => {  //we have created a logout route here,
    req.logout((err) => {   //This is a inbuilt func of node which by default takes a callback in the parameter.callback means immediately what we are suppose to do after logout. and here we are passing err.
        if (err) {
            return next(err);
        }
        req.flash('success', 'You are logged out');
        res.redirect('/listings');
    });

});



const Schemavalidate = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);    //Here we are calling the listingSchema we created in the schema.js to handle the schemavalidations.
    if (error) {                                         //And the Schemavalidate is the variable we are assigning to perform this block of the code and check we are calling Schemavalidate in the other routes below.
        let errMsg = error.details.map((el) => el.message).join(',');
        throw new ExpressError(400, errMsg);              //And we are directly assigning this to the {error} we get and passing the conditions if and all the logic thatsit.
        }
        else {
            next();
        }
    };
const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);    //Here we are calling the reviewSchema we created in the schema.js to handle the schemavalidations.
    if (error) {                                         //And the validateReview is the variable we are assigning to perform this block of the code and check we are calling Schemavalidate in the other routes below.
        let errMsg = error.details.map((el) => el.message).join(',');
        throw new ExpressError(400, errMsg);              //And we are directly assigning this to the {error} we get and passing the conditions if and all the logic thatsit.
        }
        else {
            next();
        }
    };

//Index Route
app.get('/listings',wrapAsync(async (req,res) => {
    const allListings = await Listing.find({});
    res.render('listings/index.ejs', {allListings});
}));

//New Route
app.get('/listings/new', isLoggedIn, (req,res) => {        //CREATE
    res.render('listings/new.ejs');
});

//Show Route
app.get('/listings/:id',wrapAsync(async (req,res) => {   //READ
    let {id} = req.params;
    const listing = await Listing.findById(id).populate('reviews').populate('owner');  //populate('reviews') tells Mongoose, instead of returning only the ObjectId, Fetch the actual Review documents and insert them.
    if(!listing) {
        req.flash('error', 'Listing you requested for does not exist');
        return res.redirect('/listings');
    }
    console.log(listing);
    res.render('listings/show.ejs', {listing});
}));

//Create route
app.post('/listings', isLoggedIn, Schemavalidate, wrapAsync (async (req,res,next) => {             //CREATE    
    const newListing = new Listing(req.body.listing);  // error handling concepts are present where we have created a function in wrapAsync.js file and using it here
    newListing.owner = req.user._id;    
    await newListing.save();
        req.flash('success', 'New Listing Created!');   //We will be displaying this msg when the user creates a new listing.
        res.redirect('/listings');
})
);


//Edit Route
app.get('/listings/:id/edit', isLoggedIn, isOwner, wrapAsync(async (req,res) => {    //UPDATE
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash('error', 'Listing you requested for does not exist');
        return res.redirect('/listings');
    }
    res.render('listings/edit.ejs', {listing});
}));

//Update Route
app.put('/listings/:id', isLoggedIn, isOwner, Schemavalidate, wrapAsync(async(req,res) => {         //UPDATE
    let {id} = req.params; 
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash('success', 'Listing Updated!');
    res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete('/listings/:id', isLoggedIn, isOwner, wrapAsync(async (req,res) => {       //DELETE
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash('success', 'Listing Deleted!');
    res.redirect('/listings');
}));

//Reviews(POST Review Route)

app.post('/listings/:id/reviews', validateReview, wrapAsync( async (req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review (req.body.review);

    await newReview.save();
    listing.reviews.push(newReview._id);
    await listing.save();
    req.flash('success', 'New Review Created!');
    res.redirect(`/listings/${listing._id}`);
}));

//Delete (Review Route)

app.delete('/listings/:id/reviews/:reviewId', wrapAsync(async (req,res) => {
    let { id , reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review Deleted!');
    res.redirect(`/listings/${id}`);
})
);

// app.get('/testListing', async (req,res) => {
//     let sampleListing = new Listing({
//         title: 'My New Villa',
//         description: 'By the beach',
//         price: 1200,
//         location: 'Calangute, Goa',
//         country: 'India',
//     });

//     await sampleListing.save();
//     console.log('sample was saved');
//     res.send('successful testing');
// });

app.all(/.*/, (req,res,next) => {                 //Here * is the js regex literal to match everything.
    next(new ExpressError(404, 'Page Not Found')); //we have created a class to handle the rrors in the ExpressError file and using it here to handle the errors.
});


app.use( (err, req, res, next) => {      //Created middleware to handle the error
    let{ status= 500, message='Something went wrong' } = err;        //Destructured
    res.status(status).render('error.ejs', {message});
    // res.status(status).send(message);            //in destructuring the values for status and message are given if nothing is being displayed when error occurs this will be displayed.
});    
                                       

app.listen(8080, () => {
    console.log('Server is listening to port 8080');
});

