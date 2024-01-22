module.exports = function (client, moduleDebug) {
  client.addListener('join', function (channel, who) {
    if (who === client.nick) {
      moduleDebug('Joined channel:', channel);
      client.say(channel, 'Hello, I am here!');
    }
  });
};
