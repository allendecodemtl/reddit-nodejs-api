var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));
app.set('view engine', 'pug');
app.use(express.static('static_files'))

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


app.get('/', function(req, res) {
    res.send('Hello World!');
});

app.get('/hello', function(req, res) {
    res.send('<h1>Hello ' + req.query.name + '!</h1>');
});


app.get('/calculator/:operation', function(req, res) {
    console.log(req.params);

    if (req.params.operation === 'add') {

        var ret = {
            operator: req.params.operation,
            firstOperand: req.query.num1,
            secondOperand: req.query.num2,
            solution: +req.query.num1 + +req.query.num2
        }

        res.send(ret);
    }
    else if (req.params.operation === 'sub') {

        var ret = {
            operator: req.params.operation,
            firstOperand: req.query.num1,
            secondOperand: req.query.num2,
            solution: +req.query.num1 - +req.query.num2
        }

        res.send(ret);

    }
    else if (req.params.operation === 'mult') {

        var ret = {
            operator: req.params.operation,
            firstOperand: req.query.num1,
            secondOperand: req.query.num2,
            solution: +req.query.num1 * +req.query.num2
        }

        res.send(ret);

    }
    else if (req.params.operation === 'div') {

        var ret = {
            operator: req.params.operation,
            firstOperand: req.query.num1,
            secondOperand: req.query.num2,
            solution: +req.query.num1 / +req.query.num2
        }

        res.send(ret);

    }
    else {

        res.send("Error - operation does not exist");
    }

});


app.get('/posts', function(req, res) {

    redditAPI.getAllPosts({}, connection)
    .then(function(result) {
        res.render('post-list', {posts: result});
    })
   

});

// app.get('/posts', function(req, res) {

//     redditAPI.getAllPosts({}, connection)
//         .then(function(result) {
//             //console.log(result);


//             var str = `<div id="contents">
//             <h1>List of contents</h1>
//                 <ul class="content-list">
//         `

//             result.forEach(function(item, index) {

//                 str = str + `<li class="content-item">
//                         <h2 class="content-item_title">
//                         <a href="` + item.url + `">` + item.title + `<\a>
//                         </h2>
//                         <p>Created by: ` + item.user.username + `</p>
//                         </li>`

//             });

//             str = str + `</ul></dib>`

//             res.send(str);
//         })
//         .catch(function(err) {
//             console.log(err);
//         })

// });



app.get('/createContent', function(req, res) {

   res.render('create-content');
   
});


app.post('/createContent', function(req, res) {

    redditAPI.createPost({
          title: req.body.title,
          url: req.body.url,
          userId: 1 
        }, 1, connection)
    .then(function(result) {
        console.log(result);
        res.send(result);
    })
    .catch(function(err) {
        console.log(err);
        res.send(err);
    })

});



/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});