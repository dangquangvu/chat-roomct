var redis = require('redis');
var client = redis.createClient(); // creates a new redis client
const { promisify } = require('util');
const getAsync = promisify(client.get).bind(client);
const bluebird = require('bluebird')
    //check for connection
client.on('connect', function() {
    console.log("connected");
});
var a;
var name1 = {
    name: 'vu',
    age: '21'
}
var name2 = {
    name: 'vui',
    age: '21'
}
var name3 = {
    name: 'van',
    age: '21'
}
var name4 = {
    name: 'van',
    age: '21'
}
var users = [name1, name2, name3, name4]
var chatters = ['vux', 'an', 'dducsw'];
client.set('chat-user', JSON.stringify(chatters));
// getAsync('chat-user').then(res => {
//     console.log(JSON.parse(res))
// }).catch(err => {
//     console.log(err)
// });
// clientAsync.keys('*').then(res => {
//     console.log(res)
// });
// client.getMaxListeners('*', (err, reply) => {
//     console.log('tttttt')
//     console.log(reply)
//setting key store values
// client.set('brian', 'njenga', function(err, reply) {
//     console.log(reply);
// });
// //set key with expiry -  in seconds
// client.set('name', 'brian njenga');
// client.expire('name', 40);

// //getting key store value
// client.get('brian', function(err, reply) {
//     console.log(reply);
// });

// //storing a hash - equal to row in MySQL and documents in NoSQL
// client.hmset('frameworks', {
//     'javascript': 'AngularJS',
//     'css': 'Bootstrap',
//     'node': 'Express'
// });

// //return an object of the stored hash
// client.hgetall('frameworks', function(err, object) {
//     console.log(object);
// });

// //store a list in redis while pushing elements to the right
// client.rpush(['jsframeworks', 'angularjs', 'reactjs', 'jquery'], function(err, reply) {
//     console.log(reply); //prints 3 - number of items in list
// });

// //store a list while pushing elements to the left

// client.lpush(['node_modules', 'express', 'body-parser'], function(err, reply) {
//     console.log(reply); //prints 2
// });

// //retrieve elements in the list
// client.lrange('node_modules', 0, -1, function(err, object) {
//     console.log(object);
// });

// //using sets in redis

// /*******************************************************************
//  **** NB: sets are almost like lists but they dont allow duplicates***
//  *********************************************************************/

// client.sadd(['tags', 'angular', 'ember', 'backbone'], function(err, reply) {
//     console.log(reply); // prints 3
// });

// //retrieve values of the set
// client.smembers('tags', function(err, reply) {
//     console.log(reply);
// });

// //check if clients exists
// client.exists('tags', function(err, reply) {
//     if (reply === 1)
//         console.log('exists');
//     else
//         console.log('doesnt exist');
// });
// //deleting keys
// client.del('frameworks', function(err, reply) {
//     console.log(reply);
// });
// //incrementing values
// client.set('key1', 10, function() {
//     client.incr('key1', function(err, reply) {
//         console.log(reply); // 11
//     });
// });

// //decerementing values
// client.set('key2', 10, function() {
//     client.decr('key2', function(err, reply) {
//         console.log(reply); // 9
//     });
// });
// client.keys('*', (err, reply) => {
//     console.log('tttttt')
//     reply.map(item => {

//         console.log(item)
//     })
// });

// clientR.keys('*').then(res => {
//         console.log(res)
//     }).catch(err => {
//         console.log(err)
//     })
// client.get('chat-user', (err, reply) => {
//     if (reply) {
//         a = JSON.parse(reply);
//         a.map(item => {
//             console.log(item)
//         })
//     }
// });
// client.get('users-friend', (err, reply) => {
//     if (reply) {
//         a = JSON.parse(reply);
//         a.map(item => { console.log(item.name) })
//     }
// });
// client.get('chat_users', function(err, reply) {
//     if (reply) {
//         chatters = JSON.parse(reply);
//         console.log(chatters)
//     }
// });
/**
 * ================================
 */
// var pub = redis.createClient();
// pub.publish("messages", JSON.stringify({ type: "foo", content: "bar" }));

// // // Socket handler
// io.sockets.on("connection", function(socket) {
//     var sub = redis.createClient();
//     sub.subscribe("messages");
//     sub.on("message", function(channel, message) {
//         socket.send(message);
//     });

//     socket.on("disconnect", function() {
//         sub.unsubscribe("messages");
//         sub.quit();
//     });
// });