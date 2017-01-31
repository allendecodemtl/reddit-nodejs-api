// Dependencies
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');


var app = express();

// Specify the usage of the Pug template engine
app.set('view engine', 'pug');

// Middleware
// This middleware will parse the POST requests coming from an HTML form, and put the result in req.body.  Read the docs for more info!
app.use(bodyParser.urlencoded({extended: false}));

// This middleware will parse the Cookie header from all requests, and put the result in req.cookies.  Read the docs for more info!
app.use(cookieParser());

// This middleware will console.log every request to your web server! Read the docs for more info!
app.use(morgan('dev'));

/*
IMPORTANT!!!!!!!!!!!!!!!!!

Before defining our web resources, we will need access to our RedditAPI functions.
You will need to write (or copy) the code to create a connection to your MySQL database here, and import the RedditAPI.
Then, you'll be able to use the API inside your app.get/app.post functions as appropriate.
*/
var mysql = require('promise-mysql');
var connection = mysql.createPool({
    host: process.env.IP,
    user: process.env.C9_USER,
    password: '',
    database: 'reddit',
    connectionLimit: 10
});

// load our reddit API 
var redditAPI = require('./reddit_promise');


// Resources
app.get('/', function(request, response) {
  /*
  Your job here will be to use the RedditAPI.getAllPosts function to grab the real list of posts.
  For now, we are simulating this with a fake array of posts!
  */
  redditAPI.getAllPosts({}, connection)
    .then(function(result) {
        response.render('post-list', {posts: result});
    })
});

app.get('/login', function(request, response) {
  // code to display login form
  
  var loginForm = 
  `<form action="/login" method="POST"> 
    <div>
      <input type="text" name="username" placeholder="Enter username">
    </div>
    <div>
      <input type="password" name="password" placeholder="Enter password">
    </div>
    <button type="submit">Login</button>
  </form>`

  response.send(loginForm);
  
  
});

app.post('/login', function(request, response) {
  // code to login a user
  // hint: you'll have to use response.cookie here
  
  redditAPI.checkLogin(request.body, connection)
    .then(function(result) {
        if(result === true){
            return redditAPI.createSession(request.body.username, connection)
        } 
        else {
            throw (new Error('Wrong username or password'));
        }
    })
    .then(function(result){
        response.cookie('SESSION', result);
        response.redirect('/login');
    })
    .catch(function(err){
      response.status(401).send(err);
    })

});

app.get('/signup', function(request, response) {
  // code to display signup form
  var signupForm = 
  `<form action="/signup" method="POST"> 
    <div>
      <input type="text" name="username" placeholder="Enter username">
    </div>
    <div>
      <input type="password" name="password" placeholder="Enter password">
    </div>
    <button type="submit">Sign up</button>
  </form>`

  response.send(signupForm);
});

app.post('/signup', function(request, response) {
  // code to signup a user
  // ihnt: you'll have to use bcrypt to hash the user's password
  
  console.log(request.body.username);
  
  redditAPI.createUser({
    username: request.body.username,
    password: request.body.password
  },connection)
  .then(function(res) {
      console.log(res);
      
      response.redirect('/login');
      
  })
  .catch(function(err) {
      console.log(err);
      //connection.end();
  })
  
});


app.post('/vote', function(request, response) {
  // code to add an up or down vote for a content+user combination
});


// Listen
var port = process.env.PORT || 3000;
app.listen(port, function() {
  // This part will only work with Cloud9, and is meant to help you find the URL of your web server :)
  if (process.env.C9_HOSTNAME) {
    console.log('Web server is listening on https://' + process.env.C9_HOSTNAME);
  }
  else {
    console.log('Web server is listening on http://localhost:' + port);
  }
});