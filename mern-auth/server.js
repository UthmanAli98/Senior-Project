const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");
const request = require("request")
const axios = require("axios")
const session = require('express-session')
const SpotifyStrategy = require("./config/lib/passport-spotify/index").Strategy


//Api routes
const heydjusers = require("./routes/api/heydjusers")
const partyroom = require("./routes/api/partyroom")

const refresh = require('passport-oauth2-refresh');
const cors =  require('cors')


const app = express();



// Bodyparser middleware
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(bodyParser.json());
// DB Config
const db = require("./config/keys").mongoURI;
// Connect to MongoDB
mongoose
    .connect(
        db,
        { useNewUrlParser: true }
    )
    .then(() => console.log("MongoDB successfully connected"))
    .catch(err => console.log(err));

// Passport middleware
app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }))
app.use(passport.initialize());
app.use(passport.session())



// Routes
app.use("/api/users", heydjusers)
app.use("api/partyroom", partyroom)


//Passport session start up

const clientId = '5b84921b785e49df8c29cbe5b86bd1c1'
const clientSecret = '5f4b5ceae55347169d391770b75b62d0'
const redirectUri = 'http://localhost:5000/callback'
User = require("./models/HeyDJUser")

//serialize and deserialize user are functions to handle sessions automatically
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err,user){
        done(err,user)
    })
});

const strategy = new SpotifyStrategy(
    {
        clientID: clientId,
        clientSecret: clientSecret,
        callbackURL: redirectUri
    },
    async function(accessToken, refreshToken, expires_in, profile, done) {

        process.nextTick(function () {
            console.log('Profile: ', profile)

            User.findOne({
                    SpotifyId: profile.id
                },
                function(err,user){
                    if(err){
                        return done(err)
                    }

                    if(!user){

                        user = new User({
                            name: profile.displayName,
                            SpotifyId: profile.id,
                            accessToken: accessToken,
                            proPic: profile.photos[0],
                            refreshToken: refreshToken,
                            expires_in: expires_in
                        });

                        user.save(function (err) {

                            if(err) console.log(`This is what happened${err}`)
                            return done(err,user)
                        });

                    } else{
                        return done(err,user)
                    }
                })

        })

    }
)

refresh.use(strategy)

passport.use('spotify',
    new SpotifyStrategy(
        {
            clientID: clientId,
            clientSecret: clientSecret,
            callbackURL: redirectUri
        },
        async function(accessToken, refreshToken, expires_in, profile, done) {

            process.nextTick(function () {
                console.log('Profile: ', profile)

                User.findOne({
                        SpotifyId: profile.id
                    },
                    function(err,user){
                        if(err){
                            return done(err)
                        }

                        if(!user){

                            user = new User({
                                name: profile.displayName,
                                SpotifyId: profile.id,
                                accessToken: accessToken,
                                proPic: profile.photos[0],
                                refreshToken: refreshToken,
                                expires_in: expires_in
                            });

                            user.save(function (err) {

                                if(err) console.log(`This is what happened${err}`)
                                return done(err,user)
                            });

                        } else{
                            return done(err,user)
                        }
                    })

            })

        }
    )
)

//************************************************************************************************

app.get(
    '/callback',
    function(req, res, next) {
        passport.authenticate('spotify',{failureRedirect: '/login'}, function(err, user, info) {
            if (err) {

                return next(err)
            }
            if (!user) {
                return res.redirect('/login')
            }else{
               req.login(user, function(err){

                    console.log(err)
                    if(err) return res.json(400,err);
                    res.redirect("http://localhost:3000/profile")

               })



            }

        })(req, res, next)
    }
)

app.get('/logout', function (req,res){
  req.logout();
  res.redirect('/')
})

app.get('/api/auth/me' ,(req,res,next) => {
    console.log('CURRENT SESSION: ', req.session)
    res.send(req.session)
})

app.get('/login',
    passport.authenticate('spotify', {
        scope: ['user-read-email','playlist-modify-private', 'playlist-modify-public'],
        showDialog: true

    }),
    function(req, res) {
        // The request will be redirected to spotify for authentication, so this,

        // function will not be called.
    })

app.put('/refreshAccToken', (req,res) =>{
    if(!req.body.refreshToken){
        res.status(400).json({error: 'Refresh token is missing from the body'})
    }

    var refreshToken = req.body.refreshToken
    const filter = {refreshToken: refreshToken}

    refresh.requestNewAccessToken('spotify',refreshToken, function (err, accessToken) {
        if(!accessToken){return res.status(401).end()}

        const update = {accessToken: accessToken}

        User.findOneAndUpdate(filter,update).then(console.log(" Access token update Success!"))
        res.send({accessToken: accessToken})


    })

})


    app.get('/refreshAccessToken', (req,res) =>{

        if(!req.body.refreshToken){
            res.status(400).json({error: 'Refresh token is missing from the body'})
        }
        var refreshToken = req.body.refreshToken

        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            headers: { 'Authorization': 'Basic ' + (Buffer.from(clientId + ':' + clientSecret).toString('base64')) },
            form: {
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            },
            json: true
        };

        request.post(authOptions,async function(error, response, body){
            if(!error && response.statusCode === 200){

                var access_token = body.access_token

                res.send({accessToken: access_token})
            }
        })



})





const port = process.env.PORT || 5000; // process.env.port is Heroku's port if you choose to deploy the app there
app.listen(port, () => console.log(`Server up and running on port ${port} !`));