const express = require("express");
const router = express.Router();
const PartyRoom = require("../../models/PartyRoom")


//Get a party room




//Create a party room
router.post("/createParty",(req,res) =>{

    PartyRoom.findOne({ partyId : req.body.partyId}).then(party =>{
        if(party){
            return res.status(400).json({error: "Party ID already exists"})
        }else{
            const newParty = new PartyRoom({
                title: req.body.title,
                partyId: req.body.partyId,
                host: req.body.host,
                playlist: req.body.playlist
            })

            newParty.save();
        }
    })
})



//Join party room



module.exports = router