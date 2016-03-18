var app = require('app');
var BrowserWindow = require('browser-window');

app.on('ready', function() {
  var mainWindow = new BrowserWindow({});
  mainWindow.loadURL('file://' + __dirname + '/index.html');
});