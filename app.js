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
var APP_SETTINGS_PATH = path.join(APP_BASE_PATH, 'settings.json');
var ctx, rootPath, maxDirDepth, files = [];

var initDone;
var appSettings = {
  _: (function() {
    var data = { code: '' };
    try {
      fs.openSync(APP_SETTINGS_PATH, 'r+');
      data = JSON.parse(fs.readFileSync(APP_SETTINGS_PATH, 'utf8'));
    }
    catch (e) {
      console.error(e.name + '\n' + e.message + '\n' + e.stack);
    }
    return data;
  })(),
  set: function(keyOrValues, value) {
    var isOneValue = JS.typeOf(keyOrValues, 'String'), data = this._;
    if (isOneValue) {
      data[keyOrValues] = value;
    }
    else {
      JS.walk(keyOrValues, function(value, key) {
        data[key] = value;
      });
    }
    this.save();
    return isOneValue ? value : keyOrValues;
  },
  get: function(key, opt_defaultValue) {
    return JS.has(this._, key) ? this._[key] : opt_defaultValue;
  },
  save: JS.debounce(function() {
    fs.writeFile(APP_SETTINGS_PATH, JSON.stringify(this._, null, 2), 'utf8');
  }, 500)
};

var editor = ace.edit("editor");
editor.setOptions({
  theme: "ace/theme/monokai",
  mode: "ace/mode/javascript",
  tabSize: 2,
  useSoftTabs: true
});
editor.setValue(appSettings.get('code'));
editor.on("change", JS(function() {
  var value = editor.getValue();
  var oldCtx = ctx;
  vm.createScript(value, { timeout: 3000 }).runInNewContext(ctx = { JS: JS, console: BASE_CONSOLE });
  appSettings.set('code', value);

  var jSel = $('#selRenamer');
  var i = 0, selectedIndex = jSel.prop('selectedIndex');
  jSel.html('');
  JS.walk(ctx, function(fn, name) {
    if (JS.typeOf(fn, 'Function') && fn != JS && !/^_/.test(name)) {
      if (oldCtx && oldCtx[name] + '' != fn + '') {
        selectedIndex = i;
      }
      jSel.append(JS.dom({
        nodeName: 'option',
        textContent: name,
        value: name
      }));
      i++;
    }
  }, JS.keys(ctx).sort());
  if (!initDone) {
    initDone = 1;
    selectedIndex = appSettings.get('renamerIndex');
  }
  jSel.prop('selectedIndex', appSettings.set('renamerIndex', JS.clamp(selectedIndex, 0)));

// NOTE:  Debounce no only prevents the updated script from being run every
// time a character changes but also prevents a weird error that was causing
// the caret to jump around every time an error was introduced.
}).debounce(500).callReturn().$);

(function(dirPath, dirDepth) {
  if (dirPath) {
    setDir(dirPath, dirDepth);
  }
})(appSettings.get('dirPath'), appSettings.get('dirDepth'));

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

var updatePreview = JS.debounce(function() {
  var _ = ctx._;
  var fn = ctx[$('#selRenamer :selected').val()];
  var passMediaTags = fn.GET_MEDIA_TAGS;

  $('.trDir, .trFile').each(function(i, tr) {
    var oldPath = $('#txtOldPath' + i, tr).val();
    var file = files[i];
    ctx._ = { path: oldPath, data: file };
    if (passMediaTags) {
      mm(fs.createReadStream(file.path), function (err, metadata) {
        $('#txtNewPath' + i, tr).val(fn(oldPath, file, err ? false : metadata));
      });
    }
    else {
      $('#txtNewPath' + i, tr).val(fn(oldPath, file));
    }
  });

  ctx._ = _;
}, 500);

$('#selRenamer').on('change', function() {
  appSettings.set('renamerIndex', this.selectedIndex);
});

function setDir(dirPath, inMaxDirDepth) {
  appSettings.set({ dirPath: dirPath, dirDepth: inMaxDirDepth });

  // Remove previously established rows.
  $('#tblFiles').html('');

  // Create new rows.
  var dir = recurseDirSync(txtRoot.value = dirPath, inMaxDirDepth);
  rootPath = dir.path.replace(/([^\\\/])[\\\/]$/, '$1');
  maxDirDepth = inMaxDirDepth;
  (files = JS.unnest([dir], function(file, index, add, recurse) {
    add(file);
    if (file.files) {
      recurse(file.files);
    }
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
    }
  });

  setDir(rootPath, maxDirDepth);
});

$('#btnRoot').click(function() {
  remote.dialog.showOpenDialog({
    properties: ['openDirectory'],
    defaultPath: appSettings.get('dirPath')
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