const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HeyDjUser = new Schema({

    name: {
        type: String,
        required: true
    },
    SpotifyId: {
        type: String,
        required: true
    },
    accessToken: {
        type:String,
        required: true
    },
    refreshToken:{
        type: String,
        required: true
    },
    expires_in:{
        type: Number
    }
});

module.exports = HeyDjUsers = mongoose.model("heydj_users", HeyDjUser)