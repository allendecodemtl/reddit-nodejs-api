var mysql = require('promise-mysql');

var connection = mysql.createPool({
  host     : process.env.IP,
  user     : process.env.C9_USER,
  password : '',
  database : 'reddit',
  connectionLimit: 10
});

// load our API and pass it the connection
var redditAPI = require('./reddit_promise');





// redditAPI.createUser({
//   username: 'hello67',
//   password: 'xxx'
// },connection)
// .then(function(res) {
//     console.log(res);
//     //connection.end();
// })
// .catch(function(err) {
//     console.log(err);
//     //connection.end();
// })


// redditAPI.createPost({
//       title: 'hi reddit!',
//       url: 'https://www.reddit/r/funny',
//       userId: 3
//     },connection)
// .then(function(res) {
//     console.log(res);
//     //connection.end();
// })
// .catch(function(err) {
//     console.log(err);
//     //connection.end();
// })


// redditAPI.getAllPosts({},connection)
// .then(function(res) {
//     console.log(res);
// })
// .catch(function(err) {
//     console.log(err);
// })


// redditAPI.getAllPostsForUSer(1,{},connection)
// .then(function(res) {
//     console.log(res);
// })
// .catch(function(err) {
//     console.log(err);
// })


// redditAPI.getSinglePost(3,connection)
// .then(function(res) {
//     console.log(res);
// })
// .catch(function(err) {
//     console.log(err);
// })


