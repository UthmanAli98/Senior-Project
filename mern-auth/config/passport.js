const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const keys = require("../config/keys");
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;
const passport = require('passport')
const refresh = require('passport-oauth2-refresh')
const SpotifyStrategy = require('passport-spotify').Strategy


const clientId = '5b84921b785e49df8c29cbe5b86bd1c1'
const clientSecret = '5f4b5ceae55347169d391770b75b62d0'
const redirectUri = 'http://localhost:5000/callback'
User = require('../models/HeyDJUser')
//serialize and deserialize user are functions to handle sessions automatically
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err,user){
        done(err,user)
    })
});


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


