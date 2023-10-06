const { default: mongoose } = require("mongoose");
const bcrypt = require('bcrypt');

let movieSchema = mongoose.Schema({
  Title: {type: String, required: true},
  Description: {type: String, required: true},
  Genre: {
      Name: String,
      Description: String
  },
  Director: {
      Name: String,
      Bio: String
  },
  Actors: [String],
  ImagePath: String,
  Feautured: Boolean
});
/**
 * Defines the movie schema for MongoDB.
 *
 * @typedef {Object} Movie
 * @property {string} Title - The title of the movie.
 * @property {string} Description - A brief description of the movie.
 * @property {Object} Genre - The genre information for the movie.
 * @property {string} Genre.Name - The name of the genre.
 * @property {string} Genre.Description - A description of the genre.
 * @property {Object} Director - The director information for the movie.
 * @property {string} Director.Name - The name of the director.
 * @property {string} Director.Bio - A biography of the director.
 * @property {string[]} Actors - An array of actor names in the movie.
 * @property {string} ImagePath - The path to the movie's image.
 * @property {boolean} Featured - Indicates if the movie is featured.
 */
let userSchema = mongoose.Schema({
  Username: {type: String, required: true},
  Password: {type: String, required: true},
  Email: {type: String, required: true},
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});
/**
 * Defines the user schema for MongoDB.
 *
 * @typedef {Object} User
 * @property {string} Username - The username of the user.
 * @property {string} Password - The hashed password of the user.
 * @property {string} Email - The email address of the user.
 * @property {Date} Birthday - The birthdate of the user.
 * @property {mongoose.Schema.Types.ObjectId[]} FavoriteMovies - An array of movie IDs that the user has added to favorites.
 */

/**
 * Generates a hashed password using bcrypt.
 *
 * @function
 * @param {string} password - The password to be hashed.
 * @returns {string} The hashed password.
 */
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

/**
 * Validates a password by comparing it to the stored hashed password.
 *
 * @function
 * @param {string} password - The password to be validated.
 * @returns {boolean} True if the password is valid, false otherwise.
 */
userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.Password);
};

// creation of models
let Movie = mongoose.model('movies', movieSchema);
let User = mongoose.model('users', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
