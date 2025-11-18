const Joi = require('joi');

module.exports.listingSchema = Joi.object ({  //instead of declaring the listingSchema using const and exporting it later we are directly doing the same in one line.
    listing : Joi.object ({
        title: Joi.string().required(),
        description: Joi.string().required(), //we are simply defining the schema 
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),  //Here price amount should start from 0.
        image: Joi.string().allow('',null),  //Here we wanna allow the user if he dont have any image i.e,''empty string or null value.
        category: Joi.string().valid(
            'trending','rooms','iconic cities','mountains','castles','amazing pools',
            'camping', 'farms', 'arctic','domes','boats').required(),
        }).required(),
});

module.exports.reviewSchema = Joi.object({  //Defining the reviews schema
    review:Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
});