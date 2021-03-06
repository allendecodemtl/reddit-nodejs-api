var bcrypt = require('bcrypt');
var secureRandom = require('secure-random');
var HASH_ROUNDS = 10;


function createUser(user, conn) {

    return bcrypt.hash(user.password, HASH_ROUNDS)
    .then(function(hashedPassword) {

        return conn.query(
            'INSERT INTO users (username,password, createdAt) VALUES (?, ?, ?)', [user.username, hashedPassword, new Date()]);

    })
    .then(function(results) {

        return conn.query(
            'SELECT id, username, createdAt, updatedAt FROM users WHERE id = ?', [results.insertId]);

    })
    .then(function(result) {
        return result;

    })
    .catch(function(err) {
        if (err.code === 'ER_DUP_ENTRY') {
            throw (new Error('A user with this username already exists'));
        }
        else {
            return (err);
        }
    });
}


function createPost(post, sub, conn) {

    return conn.query(
            'INSERT INTO posts (userId, title, url, createdAt, subredditId) VALUES (?, ?, ?, ?, ?)', [post.userId, post.title, post.url, new Date(), sub])
    .then(function(result) {

        return conn.query(
            'SELECT id,title,url,userId, createdAt, updatedAt, subredditId FROM posts WHERE id = ?', [result.insertId]);
    })
    .then(function(result) {

        return result;
    })
}



function getAllPosts(options, conn) {

    var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
    var offset = (options.page || 0) * limit;

    var queryStr = `
        SELECT posts.id as postId,
        posts.title,
        posts.url,
        posts.createdAt as posts_CreatedAt,
        posts.updatedAt as posts_UpdatedAt,
        users.id as usersId,
        users.username,
        users.password,
        users.createdAt as users_CreatedAt,
        users.updatedAt as users_UpdatedAt,
        subreddits.id as subredditId,
        subreddits.name,
        subreddits.description,
        SUM(IFNULL(votes.vote,0)) as Score,
        SUM(IF(IFNULL(votes.vote,0) = 1, 1, 0)) as Upvotes,
        SUM(IF(IFNULL(votes.vote,0) = -1, 1, 0)) as Downvotes
        FROM posts 
        LEFT JOIN users 
        ON posts.userid = users.id
        LEFT JOIN subreddits
        ON posts.subredditId = subreddits.id
        LEFT JOIN votes
        ON posts.id = votes.postId
        GROUP BY posts.id,
        posts.title,
        posts.url,
        posts.createdAt,
        posts.updatedAt,
        users.id,
        users.username,
        users.password,
        users.createdAt,
        users.updatedAt,
        subreddits.id,
        subreddits.name,
        subreddits.description
        ORDER BY posts.createdAt DESC
        LIMIT ? OFFSET ?
    `;

    var promOne = conn.query(queryStr, [limit, offset]);

    return promOne
    .then(function(result) {

        var arrResult = [];

        result.forEach(function(item, index) {

            var temp = {
                id: item.postId,
                title: item.title,
                url: item.url,
                createdAt: item.posts_CreatedAt,
                updatedAt: item.posts_UpdatedAt,
                score: item.Score,
                upVotes: item.Upvotes,
                downVotes: item.Downvotes,
                userId: item.usersId,
                user: {
                    id: item.usersId,
                    username: item.username,
                    createdAt: item.users_CreatedAt,
                    updatedAt: item.users_UpdatedAt
                },
                subreddit: {
                    id: item.subredditId,
                    name: item.name,
                    description: item.description
                }

            }

            arrResult.push(temp);
        })


        return arrResult;

    })
    .catch(function(err) {
        throw err;
    })
}


function getAllPostsForUser(userId, options, conn) {

    var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
    var offset = (options.page || 0) * limit;

    var queryStr = `
        SELECT posts.id as postId,
        posts.title,
        posts.url,
        posts.createdAt as posts_CreatedAt,
        posts.updatedAt as posts_UpdatedAt,
        users.id as usersId,
        users.username,
        users.password,
        users.createdAt as users_CreatedAt,
        users.updatedAt as users_UpdatedAt
        FROM posts 
        LEFT JOIN users 
        ON posts.userid = users.id
        WHERE users.id = ?
        ORDER BY posts.createdAt DESC
        LIMIT ? OFFSET ?
    `;

    var promOne = conn.query(queryStr, [userId, limit, offset]);

    return promOne
    .then(function(result) {

        //console.log(result);
        var arrResult = []

        result.forEach(function(item, index) {

            var temp = {
                id: item.postId,
                title: item.title,
                url: item.url,
                createdAt: item.posts_CreatedAt,
                updatedAt: item.posts_UpdatedAt,
                userId: item.usersId,
                user: {
                    id: item.usersId,
                    username: item.username,
                    createdAt: item.users_CreatedAt,
                    updatedAt: item.users_UpdatedAt
                }
            }
            arrResult.push(temp);
        })
        return arrResult;
    })
    .catch(function(err) {
        throw err;
    })
}


function getSinglePost(userId, conn) {

    var queryStr = `
        SELECT posts.id as postId,
        posts.title,
        posts.url,
        posts.createdAt as posts_CreatedAt,
        posts.updatedAt as posts_UpdatedAt,
        users.id as usersId,
        users.username,
        users.password,
        users.createdAt as users_CreatedAt,
        users.updatedAt as users_UpdatedAt
        FROM posts 
        LEFT JOIN users 
        ON posts.userid = users.id
        WHERE posts.id = ?
        ORDER BY posts.createdAt DESC
    `;

    var promOne = conn.query(queryStr, [userId]);

    return promOne
    .then(function(result) {

        //console.log(result);
        var arrResult = []

        result.forEach(function(item, index) {

            var temp = {
                id: item.postId,
                title: item.title,
                url: item.url,
                createdAt: item.posts_CreatedAt,
                updatedAt: item.posts_UpdatedAt,
                userId: item.usersId,
                user: {
                    id: item.usersId,
                    username: item.username,
                    createdAt: item.users_CreatedAt,
                    updatedAt: item.users_UpdatedAt
                }
            }
            arrResult.push(temp);
        })
        return arrResult;
    })
    .catch(function(err) {
        throw err;
    })
}


function createSubreddit(sub, conn) {

    return conn.query(
            'INSERT INTO subreddits (name, description, createdAt) VALUES (?, ?, ?)', [sub.name, sub.description, new Date()])
        .then(function(result) {

            return conn.query(
                'SELECT id, name, description, createdAt, updatedAt FROM subreddits WHERE id = ?', [result.insertId]);
        })
        .then(function(result) {

            return result;
        });

}


function getAllSubreddits(conn) {

    var queryStr = `
        SELECT id, name, description, createdAt, updatedAt
        FROM subreddits 
        ORDER BY createdAt DESC
    `;

    var promOne = conn.query(queryStr);

    return promOne
        .then(function(result) {
            return result;

        })
        .catch(function(err) {
            throw err;
        })
}



function createOrUpdateVote(vote, conn) {

    return conn.query(
            'INSERT INTO votes SET postId=?, userId=?, vote=? ON DUPLICATE KEY UPDATE vote=?', [vote.postId, vote.userId, vote.vote, vote.vote])
    .then(function(result) {
        console.log(result);
        return conn.query(
            'SELECT postId, userId, vote, createdAt, updatedAt FROM votes');
    })
    .then(function(result) {

        return result;
    });

}


function checkLogin(user, conn) {

    return conn.query(
            'SELECT * FROM users WHERE username = ?', [user.username])
    .then(function(result) {
        if (result.length === 0) {
            return "Error";
        }
        else {
            var userFound = result[0];
            var actualHashedPassword = userFound.password;

            return bcrypt.compare("" + [user.password], actualHashedPassword)
        }
    })
    .then(function(result) {
        return result;
    });

}

// this function creates a big random string
function createSessionToken() {
    return secureRandom.randomArray(100).map(code => code.toString(36)).join('');
}


function createSession(username, conn) {
    var token = createSessionToken();
    return conn.query('SELECT id FROM users WHERE username = ?', [username])
    .then(function(result){
        return conn.query('INSERT INTO sessions SET userId = ?, token = ?', [result[0].id, token])
    })
    .then(function(result) {
        return token;
    });
}


function getUserFromSession(sessionToken, conn) {

    return conn.query('SELECT userId FROM sessions WHERE token = ?', [sessionToken])
    .then(function(result) {
        return result;
    })

}

// Export the API
module.exports = {
    // ...
    getAllPosts: getAllPosts,
    createUser: createUser,
    createPost: createPost,
    getAllPostsForUser: getAllPostsForUser,
    getSinglePost: getSinglePost,
    createSubreddit: createSubreddit,
    getAllSubreddits: getAllSubreddits,
    createOrUpdateVote: createOrUpdateVote,
    checkLogin: checkLogin,
    createSession: createSession,
    createSessionToken: createSessionToken,
    getUserFromSession: getUserFromSession

};
