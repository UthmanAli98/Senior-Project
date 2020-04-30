const express = require("express");
const router = express.Router();
const axios = require('axios')
// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
// Load User model
const User = require("../../models/HeyDJUser");
const PartyRoom = require("../../models/PartyRoom")
const PartyMembers = require("../../models/PartyMembers")
const SpotifyWebApi = require("spotify-web-api-node")
const spotifyApi = new SpotifyWebApi()


//Party Api Routes!
router.post("/createParty",(req,res) =>{

    PartyRoom.findOne({ partyId : req.body.partyId}).then(party =>{
        if(party){
            return res.status(400).json({error: "Party ID already exists"})
        }else{


            spotifyApi.setAccessToken(req.body.accessToken)

            spotifyApi.createPlaylist(req.body.host,`${req.body.title}`,{public: false})
                .then(data =>{
                    const newParty = new PartyRoom({
                        title: req.body.title,
                        partyId: req.body.partyId,
                        host: req.body.host,
                        playlist: "",
                        partyhost: req.body.id

                    })

                    newParty.playlist = data.body.external_urls.spotify
                    newParty.playlistId = data.body.id

                    newParty.save().then(res.sendStatus(200)).catch(err =>{
                        console.log(err)
                    });

                    res.sendStatus(200).message({sucess:"Created the party!"})

                }).catch(err => {
                    console.log(err)
                    if(err.statusCode === 401){
                        const refreshData = {
                            refreshToken: req.body.refreshToken
                        }
                        axios.put("http://localhost:5000/refreshAccToken",refreshData).then(
                                console.log("Success")
                        )
                    }

                    else res.sendStatus(err.statusCode)
            })



        }
    }).catch(err =>{
        console.log(err)
    })
})

router.get("/party/:id", (req,res) =>{
    const partyId = req.params.id

    PartyRoom.findOne({partyId: partyId}).then(party =>{
        res.send(party)
    })

})

router.get("/getuser",(req,res) =>{

    const email = req.body.email

    PartyMembers.findOne({email: email}).then(partymember =>{
        res.send(partymember.name)
    })

})

router.put("/joinParty", (req,res) =>{

    const newMember = req.body.email

    PartyRoom.findOneAndUpdate({partyId: req.body.partyId}, {$push: {partymembers: newMember}},function (err,doc) {
        if(err) console.log(err)


    })

    const newPartyMember = new PartyMembers({
        email:req.body.email,
        name: req.body.name,
        party: req.body.partyId
    })

    newPartyMember.save().then(res.sendStatus(200))

   /** PartyRoom.findOne({partyId: req.body.partyId}).then(party =>{
        if(party){

            const memberList = party.partymembers
            memberList.push(req.body.email)

            party.update({partymembers: memberList})

            const newPartyMember = new PartyMembers({
                email: req.body.email,
                name: req.body.name
            })

            newPartyMember.save().then(res.sendStatus(200))

        }else{
            return res.status(404).json({error: "Party doesnot exist"})
        }
        **/

    })


router.post("/getSong", (req,res) =>{

    const songQuery = req.body.song

    console.log(req.body)
   User.findOne({SpotifyId: req.body.host}).then(partyHost =>{

       spotifyApi.setAccessToken(partyHost.accessToken)

       spotifyApi.searchTracks(songQuery, {limit: 1}).then(data =>{
           console.log(data.body.tracks[0])

           res.send(data.body.tracks)
       })
   }).catch(err =>{
       console.log("Error occurred:",err)
   })


})


// User Api Routes
router.get('/',(req,res,next) => {
    var userMap = [];

    User.find({},function(err,user){

        user.forEach(function(user){

            userMap.push(user)
            console.log(user)
        })

    })

    res.send(userMap)


})

router.get(`/:userId`,(req,res,next) => {

    User.findOne({_id: req.params.userId})
        .then(user => res.json(user))
        .catch(next)

})

router.put('/updateAccessToken/:refreshToken', (req,res,next) =>{
    const refreshToken = req.params.refreshToken

    axios.get('http://localhost:5000/refreshAccessToken',{"body": {refreshToken: refreshToken}})
        .then((response) => response.json())
        .then((result) =>{

            console.log('Success:', result)

        }).catch(err =>{
            console.log('Error:', err)
    })

})


module.exports = router;