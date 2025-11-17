const Listing = require('../models/listing');

module.exports.index = async (req,res) => {
    const allListings = await Listing.find({});
    res.render('listings/index.ejs', {allListings});
};



module.exports.renderNewForm = (req,res) => {        //CREATE
    res.render('listings/new.ejs');
};



module.exports.showListing = (async (req,res) => {   //READ
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path:'reviews', 
        populate:{ 
            path:'author',
        },
    })
    .populate('owner');  //populate('reviews') tells Mongoose, instead of returning only the ObjectId, Fetch the actual Review documents and insert them.
    if(!listing) {
        req.flash('error', 'Listing you requested for does not exist');
        return res.redirect('/listings');
    }
    console.log(listing);
    res.render('listings/show.ejs', {listing});
});



module.exports.createlisting = (async (req,res,next) => {             //CREATE    
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);  // error handling concepts are present where we have created a function in wrapAsync.js file and using it here
    newListing.owner = req.user._id;
    newListing.image = { url, filename };    
    await newListing.save();
        req.flash('success', 'New Listing Created!');   //We will be displaying this msg when the user creates a new listing.
        res.redirect('/listings');
});



module.exports.renderEditForm = (async (req,res) => {    //UPDATE
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash('error', 'Listing you requested for does not exist');
        return res.redirect('/listings');
    }
    res.render('listings/edit.ejs', {listing});
});


module.exports.updateListing = (async(req,res) => {         //UPDATE
    let {id} = req.params; 
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash('success', 'Listing Updated!');
    res.redirect(`/listings/${id}`);
});


module.exports.deleteListing = (async (req,res) => {       //DELETE
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash('success', 'Listing Deleted!');
    res.redirect('/listings');
});