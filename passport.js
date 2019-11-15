const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const GooglePlusTokenStrategy = require("passport-google-plus-token");
const FacebookTokenStrategy = require("passport-facebook-token");
const { ExtractJwt } = require("passport-jwt");
const {
  JWT_SECRET,
  oauth: { facebook, google }
} = require("./config");
const User = require("./models/user");

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromHeader("authorization"),
      secretOrKey: JWT_SECRET
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload._id);

        if (!user) {
          return done(null, false);
        }

        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);
// google oath strategy

passport.use(
  "googleToken",
  new GooglePlusTokenStrategy(
    {
      clientID: google.clientID,
      clientSecret: google.clientSecret
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // check if user exists
        const existingUser = await User.findOne({ "google.id": profile.id });
        // check if email is used in local
        const localExistingUser = await User.findOne({
          "local.email": profile.emails[0].value
        });
        if (localExistingUser) return done(null, localExistingUser);
        if (existingUser) return done(null, existingUser);
        // create user
        const newUser = new User({
          method: "google",
          google: {
            id: profile.id,
            email: profile.emails[0].value
          },
          name: profile.displayName
        });

        await newUser.save();
        done(null, newUser);
      } catch (error) {
        done(error, false, error.message);
      }
    }
  )
);

passport.use(
  "facebookToken",
  new FacebookTokenStrategy(
    {
      clientID: facebook.clientID,
      clientSecret: facebook.clientSecret
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // if facebook user
        const existingUser = await User.findOne({ "facebook.id": profile.id });
        // check if email is used in local
        const localExistingUser = await User.findOne({
          "local.email": profile.emails[0].value
        });
        if (localExistingUser) return done(null, localExistingUser);
        if (existingUser) return done(null, existingUser);

        const newUser = new User({
          method: "facebook",
          facebook: {
            id: profile.id,
            email: profile.emails[0].value
          },
          name: profile.displayName
        });

        await newUser.save();
        done(null, newUser);
      } catch (error) {
        done(null, false, error.message);
      }
    }
  )
);
