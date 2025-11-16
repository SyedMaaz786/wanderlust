const mongoose = require('mongoose');
const initData = require('./data.js'); 
const Listing = require('../models/listing.js');

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

const initDB = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('Connected to DB');

        await Listing.deleteMany({});
        initData.data = initData.data.map((obj) => (
            {...obj, owner: '69180e1620cdb305dd8246dc'}));
        await Listing.insertMany(initData.data);
        console.log('Data was initialized');

        await mongoose.connection.close();
        console.log('Connection closed');

    } catch (err) {
        console.error('Error during database initialization:', err);
    }
};

initDB();