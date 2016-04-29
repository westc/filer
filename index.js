var BrowserWindow = require('browser-window');
var NativeImage = require('native-image');

var app = require('app');
app.on('ready', function() {
  var mainWindow = new BrowserWindow({ icon: NativeImage.createFromPath(__dirname + '/images/icon-256.png') });
  mainWindow.maximize();
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  mainWindow.on('close', function() {
    app.quit();
  });
});
