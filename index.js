const express = require('express'),
      morgan = require('morgan'),
      bodyParser = require('body-parser'),
      uuid = require('uuid');

const app = express(); // Create an Express app instance

app.use(morgan('common')); // Use the 'common' format of Morgan middleware for logging HTTP request details to the console

app.use(express.static('public')); // Serve static files from the 'public' directory using Express static middleware

app.use(bodyParser.json());

let movies =  [
  {
    title: "The Shawshank Redemption",
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    genre: 
    {
      name:"Drama",
      description:'features stories with high stakes and many conflicts they follow a clearly defined narrative plot structure, portraying real-life scenarios or extreme situations with emotionally-driven characters.'
    },
    director:
    {
      name:"Frank Darabont",
      bio:'Frank Darabont is an American film director, screenwriter, and producer known for his work on acclaimed movies such as The Shawshank Redemption and The Green Mile.',
      oscar_nominations: '3'
    },
    imageUrl: "https://www.imdb.com/title/tt0111161/mediaviewer/rm3500565760"
  },
  {
    title: "The Godfather",
    description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    genre: 
    {
      name:"Crime",
      description:'These films tend to focus on conspiracies and psychopathology of criminals, and are often violent and nihilistic.'
    },
    director:
    {
      name:"Fracis ford Copella",
      bio:'American film director, producer, and screenwriter known for his influential works such as The Godfather and Apocalypse Now.',
      oscar_nominations: '14'
    },
    imageUrl: "https://www.imdb.com/title/tt0068646/mediaviewer/rm2900531200"
  },
  {
    title: "The Godfather: Part II",
    description: "The early life and career of Vito Corleone in 1920s New York City is portrayed, while his son, Michael, expands and tightens his grip on the family crime syndicate.",
    genre: 
    {
      name:"Crime",
      description:'These films tend to focus on conspiracies and psychopathology of criminals, and are often violent and nihilistic.'
    },
    director:
    {
      name:"Fracis ford Copella",
      bio:'American film director, producer, and screenwriter known for his influential works such as The Godfather and Apocalypse Now.',
      oscar_nominations: '14'
    },
    imageUrl: "https://www.imdb.com/title/tt0071562/mediaviewer/rm163709440/"
  },
  {
    title: "The Dark Knight",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    genre: 
    {
      name:"Action",
      description:'involves a protagonist or a group of protagonists facing a series of physical challenges and conflicts, such as fights, chases, and explosions, in order to achieve a goal or overcome an obstacle'
    },
    director:
    {
      name:"Christopher Nolan",
      bio:'Acclaimed British-American filmmaker known for his mind-bending, visually stunning movies such as Inception, The Dark Knight trilogy, and Interstellar.',
      oscar_nominations: '7'
    },
    imageUrl: "https://www.imdb.com/title/tt0468569/mediaviewer/rm2329269761/"
  },
  {
    title: "Schindler's List",
    description: "In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.",
    genre: 
    {
      name:"Drama",
      description:'features stories with high stakes and many conflicts they follow a clearly defined narrative plot structure, portraying real-life scenarios or extreme situations with emotionally-driven characters.'
    },
    director:
    {
      name:"Steven Spielberg",
      bio:'American film director, producer, and screenwriter known for his iconic and influential works such as Jaws, E.T. the Extra-Terrestrial, Jurassic Park, and Schindler\'s List.',
      oscar_nominations: '17'
    },
    imageUrl: "https://www.imdb.com/title/tt0108052/mediaviewer/rm1693677824/"
  },
  {
    title: "Pulp Fiction",
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    genre: 
    {
      name:"Action",
      description:'involves a protagonist or a group of protagonists facing a series of physical challenges and conflicts, such as fights, chases, and explosions, in order to achieve a goal or overcome an obstacle'
    },
    director:
    {
      name:"Quentin Tarantino",
      bio:' American film director, screenwriter, and actor known for his signature nonlinear storytelling, vivid dialogue, and graphic violence in iconic movies such as Pulp Fiction, Kill Bill, and Django Unchained.',
      oscar_nominations: '10'
    },
    imageUrl: "https://www.imdb.com/title/tt0110912/mediaviewer/rm1385337601/"
  },
  {
    title: "Fight Club",
    description: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.",
    genre: 
    {
      name:"Action",
      description:'involves a protagonist or a group of protagonists facing a series of physical challenges and conflicts, such as fights, chases, and explosions, in order to achieve a goal or overcome an obstacle'
    },
    director:
    {
      name:"David Fincher",
      bio:'American film director and producer known for his distinctive visual style, dark themes, and technical precision in films such as Fight Club, The Social Network, and Gone Girl.',
      oscar_nominations: '2'
    },
    imageUrl: "https://www.imdb.com/title/tt0137523/mediaviewer/rm2747498497/"
  },
  {    
    title: "Forrest Gump",
    description: "The story depicts several decades in the life of Forrest Gump, a slow-witted but kind-hearted and athletically-talented man from Alabama who witnesses and unwittingly influences several defining historical events in the 20th century United States.",
    genre: 
    {
      name:"Drama",
      description:'features stories with high stakes and many conflicts they follow a clearly defined narrative plot structure, portraying real-life scenarios or extreme situations with emotionally-driven characters.'
    },
    director:
    {
      name:"Robert Zemeckis",
      bio:'American filmmaker known for his innovative use of special effects and diverse filmography, including Forrest Gump, Back to the Future trilogy, and Cast Away.',
      oscar_nominations: '7'
    },
    image_url: "https://www.imdb.com/title/tt0109830/mediaviewer/rm1954748672/?ref_=tt_ov_i"
  },
  {
    title: "Star Wars: Episode V - The Empire Strikes Back",
    description:"Star Wars: Episode V - The Empire Strikes Back continues the story of Luke Skywalker and the Rebel Alliance's fight against the Galactic Empire, while facing new challenges and discovering shocking revelations.",
    genre: 
    {
      name:"Sci-Fi",
      description:'The science fiction (sci-fi) movie genre typically explores imaginative and futuristic concepts that often serves as a vehicle for exploring social, political, and philosophical issues'
    },
    director:
    {
      name:"Irvin Kershner",
      bio:'American filmmaker known for directing the acclaimed movie, The Empire Strikes Back, and a number of other notable films such as RoboCop 2 and Never Say Never Again.',
      oscar_nominations: '1'
    },  
    image_url: "https://www.imdb.com/title/tt0080684/mediaviewer/rm3114097664/?ref_=tt_ov_i"
  },
  {
    title: "The Lord of the Rings: The Return of the King",    
    description: "The film is the final installment in the Lord of the Rings trilogy, and follows the journey of hobbit Frodo Baggins as he and his fellow members of the Fellowship of the Ring make their final stand against the forces of Sauron.",
    genre: 
    {
      name:"Fantasy",
      description:'genre with fantastic themes, usually magic, supernatural events, mythology, folklore, or exotic fantasy worlds. The genre is considered a form of speculative fiction'
    },
    director:
    {
      name:"Peter Jackson",
      bio:'Acclaimed New Zealand filmmaker known for his epic adaptations of The Lord of the Rings trilogy, The Hobbit trilogy, and other notable works such as King Kong and Heavenly Creatures.',
      oscar_nominations: '13'
    },
    image_url: "https://www.imdb.com/title/tt0167260/mediaviewer/rm584928512/?ref_=tt_ov_i"
  }
];

let users = [
  {
    id:"1",
    name: "JohnDoe",
    favoritesList: ["The Shawshank Redemption"]
  },
  {
    id:"2",
    name: "JaneDoe",
    favoritesList: ["The Lord of the Rings: The Return of the King"]
  },
  {
    id:"3",
    name: "MooVguy",
    favoritesList: []
  }
];


app.get('/documentation', (req, res) => {                  
  console.log('Documentation Request');
  res.sendFile('public/Documentation.html', {root: __dirname});
});

app.get('/', (req, res) => {
  console.log('Welcome to myFlix');
  res.send('Welcome to myFlix!');
});

app.get('/movies', (req, res) => {
  res.status(200).json(movies);
  console.log('Movies request');
});

app.get('/movies/:title', (req, res) => {
  const {title} = req.params;
  const movie = movies.find(movie => movie.title === title);
  
  if (movie) {
    res.status(200).json(movie);
  } else{
    res.status(400).send('no such movie')
  }
});

app.get('/movies/genre/:genreName', (req, res) => {
  const {genreName} = req.params;
  const genre = movies.find(movie => movie.genre.name === genreName).genre;
  
  if (genre) {
    res.status(200).json(genre);
  } else{
    res.status(400).send('no such genre')
  }
});

app.get('/movies/director/:directorName',(req,res)=>{
  const {directorName} =req.params;
  const director = movies.find(movie => movie.director.name === directorName).director;
 
  if (director){
      res.status(200).json(director);
  }else{
      res.status(400).send('no such director found');
  }
});


//CREATE
app.post('/users', (req,res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
    console.log('New User Created!');
    }
    else {
      res.status(400).send('new user not found')
    }
});

app.post('/users/:id/:favoriteMovieTitle', (req,res)=>{
  const{id, favoriteMovieTitle}=req.params;

  let user=users.find(user=>user.id == id);

  if(user){
      user.favoritesList.push(favoriteMovieTitle);
      res.status(201).send('movie added to your favorites list');
      console.log(favoriteMovieTitle);
  }else{
      res.status(400).send('movie not added');
  }
});


//UPDATE
app.put('/users/:id', (req, res)=>{
  const {id}=req.params;
  const userUpdate=req.body;

  let user=users.find(user=>user.id === id);

  if(user){
      user.name=userUpdate.name;
      res.status(201).json(user);
      console.log('User Name Updated!');
  }else{
      res.status(400).send('cannot update');
  }
});


//DELETE
app.delete('/users/:id/:favoriteMovieTitle', (req,res)=>{
  const {id, favoriteMovieTitle} =req.params;

  let user = users.find(user=>user.id ==id);

  if(user){ user.favoritesList=user.favoritesList.filter(title=>title !== favoriteMovieTitle);
      res.status(201).send('movie was deleted from your favorites');
  }else{
      res.status(400).send('movie was not deleted');
  }
});

app.delete('/users/:id', (req, res) => {
  const {id} = req.params;
  
  let user = users.find(user => user.id === id );

  if (user) {
    users = users.filter(user => user.id !== req.params.id);
    res.status(201).send('User account ' + req.params.id + ' was deleted.');
  }
});


// Morgan middleware error handling function
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Error');
});
// listen for requests on port8080
app.listen(8080, () => {
  console.log('App is listening on port 8080');
});