/**
 * Import necessary modules and set up Express.js.
 */
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const mongoose = require('mongoose');
const Models = require('./models');
const { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;

// Integrating Mongoose with REST API, cfDB is the name of the Database with movies and users

// Network database URI
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Local database URI
// mongoose.connect('mongodb://127.0.0.1:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('common', { stream: accessLogStream }));
app.use(express.static('public'));

/**
 * CORS middleware to handle Cross-Origin Resource Sharing.
 */
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://myflix404.netlify.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const cors = require('cors');
let allowedOrigins = [
  'https://brobinson404.github.io',
  'http://localhost:4200',
  'http://localhost:8080',
  'http://localhost:1234',
  'https://myflix404.netlify.app',
  'https://64893e64ab15665898477060--myflix404.netlify.app/'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

/**
 * Handles GET requests to the root path.
 */
app.get('/', (req, res) => {
  res.send('Welcome to my movie API!');
});

/**
 * Handles POST request for creating a new user via JSON object in the body.
 *
 * @param {string} '/users' - The route path for creating a new user.
 * @param {Function} check() - Middleware to validate user input.
 * @param {string} 'Username' - The name of the input field to validate.
 * @param {string} 'Password' - The name of the input field to validate.
 * @param {string} 'Email' - The name of the input field to validate.
 * @param {string} 'Birthday' - The name of the input field to validate.
 * @param {Function} (req, res) - The request and response objects.
 * @returns {JSON} Returns a JSON response with the created user or validation errors.
 */
app.post('/users',
  [
    check('Username', 'Username is required and must be more than 3 alphanumeric characters').isLength({ min: 3 }),
    check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

/**
 * Handles GET request to retrieve all users.
 *
 * @param {string} '/users' - The route path for retrieving all users.
 * @param {Function} passport.authenticate('jwt', { session: false }) - Passport middleware for authentication.
 * @param {Function} (req, res) - The request and response objects.
 * @returns {JSON} Returns a JSON response with all user data.
 */
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Handles GET request to retrieve a user by username.
 *
 * @param {string} '/users/:Username' - The route path for retrieving a user by username.
 * @param {Function} passport.authenticate('jwt', { session: false }) - Passport middleware for authentication.
 * @param {Function} (req, res) - The request and response objects.
 * @returns {JSON} Returns a JSON response with the requested user data.
 */
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Update user info by Username.
 *
 * @param {string} '/users/:Username' - The route path for updating user information by username.
 * @param {Function} passport.authenticate('jwt', { session: false }) - Passport middleware for authentication.
 * @param {Function} (req, res) - The request and response objects.
 * @returns {JSON} Returns a JSON response with the updated user data.
 * @throws {Error} Throws an error if the update fails.
 */
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $set: {
      Username: req.body.Username,
      Email: req.body.Email,
      Password: req.body.Password,
      Birthday: req.body.Birthday
    }
  }, { new: true })
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Add a movie to a user's list of favorites.
 *
 * @param {string} '/users/:Username/movies/:MovieID' - The route path for adding a movie to a user's favorites.
 * @param {Function} passport.authenticate('jwt', { session: false }) - Passport middleware for authentication.
 * @param {Function} (req, res) - The request and response objects.
 * @returns {JSON} Returns a JSON response with the updated user data.
 * @throws {Error} Throws an error if the update fails.
 */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    { $push: { FavoriteMovies: req.params.MovieID } },
    { new: true }
  )
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * DELETE a movie from a user's list of favorites.
 *
 * @param {string} '/users/:Username/movies/:MovieID' - The route path for deleting a movie from a user's favorites.
 * @param {Function} passport.authenticate('jwt', { session: false }) - Passport middleware for authentication.
 * @param {Function} (req, res) - The request and response objects.
 * @returns {JSON} Returns a JSON response with the updated user data.
 * @throws {Error} Throws an error if the update fails.
 */
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    { $pull: { FavoriteMovies: req.params.MovieID } },
    { new: true }
  )
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Delete a user by username.
 *
 * @param {string} '/users/:Username' - The route path for deleting a user by username.
 * @param {Function} passport.authenticate('jwt', { session: false }) - Passport middleware for authentication.
 * @param {Function} (req, res) - The request and response objects.
 * @returns {JSON} Returns a JSON response indicating success or failure of the deletion.
 * @throws {Error} Throws an error if the deletion fails.
 */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Handles GET request to retrieve all movies.
 *
 * @param {string} '/movies' - The route path for retrieving all movies.
 * @param {Function} passport.authenticate('jwt', { session: false }) - Passport middleware for authentication.
 * @param {Function} (req, res) - The request and response objects.
 * @returns {JSON} Returns a JSON response with all movie data.
 */
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Handles GET request to retrieve a movie by title.
 *
 * @param {string} '/movies/:Title' - The route path for retrieving a movie by title.
 * @param {Function} passport.authenticate('jwt', { session: false }) - Passport middleware for authentication.
 * @param {Function} (req, res) - The request and response objects.
 * @returns {JSON} Returns a JSON response with the requested movie data.
 */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Handles GET request to retrieve a genre by name.
 *
 * @param {string} '/movies/genres/:Name' - The route path for retrieving a genre by name.
 * @param {Function} passport.authenticate('jwt', { session: false }) - Passport middleware for authentication.
 * @param {Function} (req, res) - The request and response objects.
 * @returns {JSON} Returns a JSON response with the requested genre data.
 */
app.get('/movies/genres/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Name })
    .then((movie) => {
      res.json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Handles GET request to retrieve a director by name.
 *
 * @param {string} '/movies/directors/:Name' - The route path for retrieving a director by name.
 * @param {Function} passport.authenticate('jwt', { session: false }) - Passport middleware for authentication.
 * @param {Function} (req, res) - The request and response objects.
 * @returns {JSON} Returns a JSON response with the requested director data.
 */
app.get('/movies/directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name })
    .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Create a new movie.
 *
 * @param {string} '/movies' - The route path for creating a new movie.
 * @param {Function} passport.authenticate('jwt', { session: false }) - Passport middleware for authentication.
 * @param {Function} (req, res) - The request and response objects.
 * @returns {JSON} Returns a JSON response with the created movie data.
 * @throws {Error} Throws an error if movie creation fails.
 */
app.post('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.body.Title })
    .then((movie) => {
      if (movie) {
        return res.status(400).send(req.body.Title + ' already exists');
      } else {
        Movies
          .create({
            Title: req.body.Title,
            Description: req.body.Description,
            Genre: {
              Name: req.body.Genre.Name,
              Description: req.body.Genre.Description
            },
            Director: {
              Name: req.body.Director.Name,
              Bio: req.body.Director.Bio,
              Birth: req.body.Director.Birth
            },
            Actors: req.body.Actors,
            ImagePath: req.body.ImagePath,
            Featured: req.body.Featured
          })
          .then((movie) => { res.status(201).json(movie) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

/**
 * Update a movie by title.
 *
 * @param {string} '/movies/:Title' - The route path for updating a movie by title.
 * @param {Function} passport.authenticate('jwt', { session: false }) - Passport middleware for authentication.
 * @param {Function} (req, res) - The request and response objects.
 * @returns {JSON} Returns a JSON response with the updated movie data.
 * @throws {Error} Throws an error if the update fails.
 */
app.put('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOneAndUpdate({ Title: req.params.Title }, {
    $set:
    {
      Title: req.body.Title,
      Description: req.body.Description,
      Genre: {
        Name: req.body.Genre.Name,
        Description: req.body.Genre.Description
      },
      Director: {
        Name: req.body.Director.Name,
        Bio: req.body.Director.Bio,
        Birth: req.body.Director.Birth
      },
      Actors: req.body.Actors,
      ImagePath: req.body.ImagePath,
      Featured: req.body.Featured
    }
  },
    { new: true })
    .then((updatedMovie) => {
      res.json(updatedMovie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Delete a movie by title.
 *
 * @param {string} '/movies/:Title' - The route path for deleting a movie by title.
 * @param {Function} passport.authenticate('jwt', { session: false }) - Passport middleware for authentication.
 * @param {Function} (req, res) - The request and response objects.
 * @returns {JSON} Returns a JSON response indicating success or failure of the deletion.
 * @throws {Error} Throws an error if the deletion fails.
 */
app.delete('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOneAndRemove({ Title: req.params.Title })
    .then((movie) => {
      if (!movie) {
        res.status(400).send(req.params.Title + ' was not found');
      } else {
        res.status(200).send(req.params.Title + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Error handling middleware.
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
