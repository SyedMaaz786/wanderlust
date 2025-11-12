const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const { listingSchema } = require('./schema.js')



const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
main()
.then( () => {
    console.log('Connected to DB');
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


app.get('/', (req,res) => {
    res.send('Hi, i am root');
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

//Index Route
app.get('/listings',wrapAsync(async (req,res) => {
    const allListings = await Listing.find({});
    res.render('listings/index.ejs', {allListings});
}));

//New Route
app.get('/listings/new', (req,res) => {        //CREATE
    res.render('listings/new.ejs');
});

//Show Route
app.get('/listings/:id',wrapAsync(async (req,res) => {   //READ
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/show.ejs', {listing});
}));

//Create route
app.post('/listings', Schemavalidate, wrapAsync (async (req,res,next) => {             //CREATE
        const newListing = new Listing(req.body.listing);  // error handling concepts are present where we have created a function in wrapAsync.js file and using it here
        await newListing.save();
        res.redirect('/listings');
})
);


//Edit Route
app.get('/listings/:id/edit', wrapAsync(async (req,res) => {    //UPDATE
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render('listings/edit.ejs', {listing});
}));

//Update Route
app.put('/listings/:id', Schemavalidate, wrapAsync(async(req,res) => {         //UPDATE
    let {id} = req.params; 
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete('/listings/:id', wrapAsync(async (req,res) => {       //DELETE
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect('/listings');
}));

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

