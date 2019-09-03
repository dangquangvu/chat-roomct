const redis = require('redis');
var sub = redis.createClient(),
    pub = redis.createClient();

sub.on("subscribe", function(channel, count) {
    pub.publish("first", "first channel");
    pub.publish("second", "second channel");
});

sub.on("message", function(channel, message) {
    console.log("sub channel " + channel + ": " + message);
});

sub.subscribe("first");
sub.subscribe("second");