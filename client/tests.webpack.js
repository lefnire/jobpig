var context = require.context('./src', true, /\.mocha\.jsx?$/);
context.keys().forEach(context);
module.exports = context;