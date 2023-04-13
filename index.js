const express = require('express'),
  morgan = require('morgan');

const app = express(); // Create an Express app instance

app.use(morgan('common')); // Use the 'common' format of Morgan middleware for logging HTTP request details to the console

app.use(express.static('public')); // Serve static files from the 'public' directory using Express static middleware

app.get('/', (req, res) => {
  res.send('Welcome to my app!'); // Define a route for the root URL ('/') that sends a 'Welcome to my app!' response when accessed with a GET request
});

app.get('/movies', (req, res) => {
    res.json(topMovies); // Define a route for the '/movies' URL that sends a JSON response of `topMovies` when accessed with a GET request.
});

app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname }); // Define a route for the '/documentation' URL that sends the 'documentation.html' file from the 'public' directory as a response when accessed with a GET request.

});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');// Listen for incoming requests on port 8080
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!'); // Define an error handling middleware that catches any errors that occur during the request handling process.
});