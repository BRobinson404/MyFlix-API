const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  Models = require("./models"),
  passportJWT = require("passport-jwt");

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

/**
 * Defines a local authentication strategy using Passport.js.
 *
 * @type {passport.Strategy}
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: "Username",
      passwordField: "Password",
    },
    /**
     * Callback function for local authentication strategy.
     *
     * @param {string} username - The username provided by the user.
     * @param {string} password - The password provided by the user.
     * @param {function} callback - The callback function to be called upon completion.
     */
    async (username, password, callback) => {
      console.log(username + "  " + password);
      
      try {
        const user = await Users.findOne({ Username: username });
        
        if (!user) {
          console.log("incorrect username");
          return callback(null, false, {
            message: "Incorrect username or password.",
          });
        }
        
        if (!user.validatePassword(password)) {
          console.log('incorrect password');
          return callback(null, false, {
            message: 'Incorrect password.'});
        }

        console.log("finished");
        return callback(null, user);
      } catch (error) {
        console.log(error);
        return callback(error);
      }
    }
  )
);

/**
 * Defines a JWT authentication strategy using Passport.js.
 *
 * @type {passport.Strategy}
 */
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "your_jwt_secret",
    },
    /**
     * Callback function for JWT authentication strategy.
     *
     * @param {Object} jwtPayload - The JWT payload containing user information.
     * @param {function} callback - The callback function to be called upon completion.
     */
    (jwtPayload, callback) => {
      return Users.findById(jwtPayload._id)
        .then((user) => {
          return callback(null, user);
        })
        .catch((error) => {
          return callback(error);
        });
    }
  )
);
