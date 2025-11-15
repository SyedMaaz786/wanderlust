const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const userSchema = new Schema ({    //This is the passport schema we created.
    email: {
        type: String,
        require: true,
    },
});

userSchema.plugin(passportLocalMongoose);  //plugin-this implements username, hashing, salting hash password automatically by the node.js
module.exports = mongoose.model('User', userSchema);  //This is the model for the passport schema we created above