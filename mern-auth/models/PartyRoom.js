const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const PartyRoom =  new Schema ({

    partyId:{
        type:String,
        required: true
    },
    title: {
    type: String
},
    host:{
    type:String
    },
    partymembers: [],
    playlist: String,
    partyhost:{
        type:String
    },
    playlistId : String


})


module.exports = PartyRooms =  mongoose.model("party_room", PartyRoom)