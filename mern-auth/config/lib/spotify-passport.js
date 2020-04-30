const passport = require('passport')
const SpotifyStrategy = require('passport-spotify').Strategy
const clientId = '5b84921b785e49df8c29cbe5b86bd1c1'
const clientSecret = '5f4b5ceae55347169d391770b75b62d0'
const redirectUri = 'http://localhost:5000/callback'//make you put this redirect uri on your Spotify's developer dashboard


//serialize and deserialize user are functions to handle sessions automatically
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use('spotify',
    new SpotifyStrategy(
        {
            clientID: clientId,
            clientSecret: clientSecret,
            callbackURL: redirectUri
        },
        async function(accessToken, refreshToken, expires_in, profile, done) {
            try {
                const userResponse = {
                    ...profile,
                    accessToken,
                    refreshToken,
                    expires_in
                }
                done(null, userResponse)
            } catch (err) {
                done(err, null, { message: 'An error ocurred trying to authenticate the user'})
            }
        }
    )
)