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

//Integrating Mongoose with REST API, cfDB is the name of Database with movies and users

// Network database URI
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Local database URI
// mongoose.connect('mongodb://127.0.0.1:27017/cfDB', { useNewUrlParser: true, useUnifiedTopology: true });

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('common', { stream: accessLogStream }));
app.use(express.static('public'));

// CORS middleware
app.use(( res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://myflix404.netlify.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const cors = require('cors');
let allowedOrigins = ['http://localhost:4200', 'http://localhost:8080', 'http://localhost:1234', 'https://myflix404.netlify.app', 'https://64893e64ab15665898477060--myflix404.netlify.app/'];
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

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to my movie API!');
});

// Create USER via JSON object in the body.
// Expected format for creating/updating user information:
// {
//   "Username": "string",
//   "Password": "string",
//   "Email": "string",
//   "Birthday": "Date" "YYYY-MM-DD"
// }
app.post('/users',
  [
    check('Username', 'Username is required and must be more than 3 alphanumeric characters').isLength({ min: 3 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
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

// Get all users
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

// Get a user by username
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

// Update user info by Username
// Expected format for creating/updating user information:
// {
//   "Username": "string",
//   "Password": "string",
//   "Email": "string",
//   "Birthday": "Date" "YYYY-MM-DD"
// }
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

// Add a movie to a user's list of favorites
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

// DELETE a movie from a user's list of favorites
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

// Delete a user by username
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

// Get all movies
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

// Get a movie by title
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

// Get a genre by name
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

// Get a director by name
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

// Create a new movie
// Expected format for creating a movie:
// {
//   "Title": "string",
//   "Description": "string",
//   "Genre": {
//     "Name": "string",
//     "Description": "string"
//   },
//   "Director": {
//     "Name": "string",
//     "Bio": "string",
//     "Birth": "Date" "YYYY-MM-DD"
//   },
//   "Actors": ["string"],
//   "ImagePath": "string",
//   "Featured": Boolean
// }
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

// Update a movie by title
// Expected format for updating a movie:
// {
//   "Title": "string",
//   "Description": "string",
//   "Genre": {
//     "Name": "string",
//     "Description": "string"
//   },
//   "Director": {
//     "Name": "string",
//     "Bio": "string",
//     "Birth": "Date" "YYYY-MM-DD"
//   },
//   "Actors": ["string"],
//   "ImagePath": "string",
//   "Featured": Boolean
// }
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

// Delete a movie by title
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});