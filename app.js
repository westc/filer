var fs = require('fs');
var vm = require('vm');
var path = require('path');
var remote = require('remote');
var mm = require('musicmetadata');

var BASE_CONSOLE = JS.map(console, function(value, name) {
  return JS.isFunction(value)
    ? function () {
        return console[name].apply(console, arguments);
      }
    : value;
}, true);

var APP_BASE_PATH = path.dirname(require.main.filename);
var FUNCTIONS_PATH = path.join(APP_BASE_PATH, 'functions.js');
var ctx, rootPath, maxDirDepth, files = [];

var editor = ace.edit("editor");
editor.setOptions({
  theme: "ace/theme/monokai",
  mode: "ace/mode/javascript",
  tabSize: 2,
  useSoftTabs: true
});
editor.on("change", JS.callReturn(JS.debounce(function() {
  var value = editor.getValue();
  vm.createScript(value, { timeout: 3000 }).runInNewContext(ctx = { JS: JS, console: BASE_CONSOLE });
  fs.writeFile(FUNCTIONS_PATH, value, 'utf8');

  var jSel = $('#selRenamer');
  var selected = jSel.find(':selected').val();
  jSel.html('');
  JS.walk(ctx, function(fn, name) {
    if (JS.typeOf(fn, 'Function') && fn != JS && !/^_/.test(name)) {
      jSel.append(JS.dom({
        nodeName: 'option',
        textContent: name,
        value: name,
        selected: selected == name
      }));
    }
  }, JS.keys(ctx).sort());
}, 1000)));

try {
  fs.openSync(FUNCTIONS_PATH, 'r+');
  editor.setValue(fs.readFileSync(FUNCTIONS_PATH, 'utf8'));
} catch (e) {alert(e.name + '\n' + e.message + '\n' + e.stack);}

function recurseDirSync(currentDirPath, depthLeft, opt_filter) {
  depthLeft--;

  var result = {
    isFile: false,
    path: currentDirPath,
    stat: fs.statSync(currentDirPath),
    files: []
  };

  fs.readdirSync(currentDirPath).forEach(function (name) {
    var filePath = path.join(currentDirPath, name),
      stat = fs.statSync(filePath),
      isFile = stat.isFile();
    if ((isFile || stat.isDirectory()) && (!opt_filter || opt_filter(filePath, isFile, stat))) {
      result.files.push((isFile || !depthLeft) ? { isFile: isFile, path: filePath, stat: stat } : recurseDirSync(filePath, depthLeft, opt_filter));
    }
  });
  return result;
}

function unnestArray(arr, callback) {
  function recurse(arr, path) {
    function f(arr, opt_insertBefore) {
      dontAddRet = dontAddRet || !arguments.length;
      if (arr) {
        results.push.apply(opt_insertBefore ? results : after, recurse(arr, curPath));
      }
    }
    for (var ret, dontAddRet, curPath, results = [], after = [], i = 0, l = arr.length; i < l; i++) {
      dontAddRet = 0;
      ret = callback(arr[i], f, curPath = path.concat([i]), arr);
      results = results.concat(dontAddRet ? [] : [ret], after.splice(0));
    }
    return results;
  }
  return recurse(arr, []);
}

var updatePreview = JS.debounce(function() {
  var fn = ctx[$('#selRenamer :selected').val()];
  var passMediaTags = fn.GET_MEDIA_TAGS;

  $('.trDir, .trFile').each(function(i, tr) {
    var oldPath = $('#txtOldPath' + i, tr).val();
    var file = files[i];
    if (passMediaTags) {
      mm(fs.createReadStream(file.path), function (err, metadata) {
        $('#txtNewPath' + i, tr).val(fn(oldPath, file, err ? false : metadata));
      });
    }
    else {
      $('#txtNewPath' + i, tr).val(fn(oldPath, file));
    }
  });
}, 500);



function setDir(dirPath, inMaxDirDepth) {
  // Remove previously established rows.
  $('#tblFiles').html('');

  // Create new rows.
  var dir = recurseDirSync(txtRoot.value = dirPath, inMaxDirDepth);
  rootPath = dir.path.replace(/([^\\\/])[\\\/]$/, '$1');
  maxDirDepth = inMaxDirDepth;
  (files = unnestArray([dir], function(file, recurse) {
    if (file.files) {
      recurse(file.files);
    }
    return file;
  })).shift();

  files.forEach(function(file, i) {
    var relPath = file.path.replace(rootPath, '.');
    var tr = JS.extend(tblFiles.insertRow(i), {
      id: 'trFile' + i,
      className: file.isFile ? 'trFile' : 'trDir'
    });
    JS.extend(tr.insertCell(0), {
      className: 'tdCheck'
    }).appendChild(JS.dom({
      nodeName: 'input',
      type: 'checkbox',
      checked: true,
      onfocus: function() {
        $('#trFile' + i).addClass('focus');
      },
      onblur: function() {
        $('#trFile' + i).removeClass('focus');
      }
    }));
    JS.extend(tr.insertCell(1), {
      className: 'tdTextboxes'
    }).appendChild(JS.dom({
      nodeName: 'table',
      className: 'tblTextboxes',
      border: 0,
      cellPadding: 0,
      cellSpacing: 0,
      children: [
        {
          nodeName: 'tr',
          children: [
            {
              nodeName: 'td',
              className: 'tdOld',
              children: [
                {
                  nodeName: 'input',
                  type: 'text',
                  readOnly: true,
                  tabIndex: -1,
                  id: 'txtOldPath' + i,
                  value: relPath
                }
              ]
            },
            {
              nodeName: 'td',
              innerHTML: '&rarr;',
              className: 'tdArrow'
            },
            {
              nodeName: 'td',
              className: 'tdNew',
              children: [
                {
                  nodeName: 'input',
                  type: 'text',
                  value: relPath,
                  id: 'txtNewPath' + i,
                  onfocus: function() {
                    $('#trFile' + i).addClass('focus');
                  },
                  onblur: function() {
                    $('#trFile' + i).removeClass('focus');
                  }
                }
              ]
            }
          ]
        }
      ]
    }));
  });
}

$('#btnApply').click(updatePreview);

$('#btnRenameFiles').click(function() {
  JS.walk(files, function(file, i) {
    var oldPath = file.path;
    var newPath = path.normalize(rootPath + path.sep + $('#txtNewPath' + i).val()), pathToCheck = newPath, pathsToCreate = [];

    if (oldPath != newPath) {
      while((pathToCheck = path.dirname(pathToCheck)).length > rootPath.length && !fs.existsSync(pathToCheck)) {
        pathsToCreate.unshift(pathToCheck);
      }
      pathsToCreate.forEach(JS.cap(fs.mkdirSync, 1));
      if (!fs.existsSync(newPath)) {
        fs.renameSync(oldPath, newPath);
      }

      // If this is a directory make sure to fix the paths of all of the underlying files.
      unnestArray([file], function(file, recurse) {
        if (file.files) {
          recurse(file.files);
        }
        return file;
      });
    }
  });

  setDir(rootPath, maxDirDepth);
});

$('#btnRoot').click(function() {
  remote.dialog.showOpenDialog({
    properties: ['openDirectory']
  }, function(paths) {
    if (paths) {
      remote.dialog.showMessageBox({
        type: 'info',
        buttons: ['Base Only','2','3','All'],
        message: 'File Depth',
        detail: 'How many directories down should be traversed?'
      }, function(index) {
        setDir(paths[0], index < 3 ? index + 1 : Infinity);
      });
    }
  });
});