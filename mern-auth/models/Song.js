const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Songs = new Schema({

    name: {
        type: String,
        required: true
    },
    songId: {
        type: String,
        required: true
    },
    uri: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    }


})


module.exports = Song =  mongoose.model("songs", Songs)