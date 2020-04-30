const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema for the users of the application
const PartyMembersSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },

    party: String

});
module.exports = User = mongoose.model("party_members", PartyMembersSchema);