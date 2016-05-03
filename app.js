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
var ctx, rootPath, maxDirDepth, isResizingPanels, lastChkIndex, files = [];

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

(function(dirPath, dirDepth, split) {
  if (dirPath) {
    setDir(dirPath, dirDepth);
  }
  if (split != undefined) {
    repositionSplit(split);
  }
})(appSettings.get('dirPath'), appSettings.get('dirDepth'), appSettings.get('split'));

var editor = ace.edit("editor");
editor.setOptions({
  theme: "ace/theme/monokai",
  mode: "ace/mode/javascript",
  tabSize: 2,
  useSoftTabs: true
});
editor.setValue(appSettings.get('code'));
editor.on("change", JS(function() {
  var value = editor.getValue(),
      oldCtx = ctx;
  vm.createScript(value, { timeout: 3000 }).runInNewContext(ctx = { JS: JS, console: BASE_CONSOLE });
  appSettings.set('code', value);

  var jSel = $('#selRenamer');
      i = 0,
      selectedIndex = jSel.prop('selectedIndex');
  jSel.html('');
  JS.walk(ctx, function(fn, name) {
    if (JS.typeOf(fn, 'Function') && fn != JS && !/^_/.test(name)) {
      if (oldCtx && oldCtx[name] + '' != fn + '') {
        selectedIndex = i;
      }
      jSel.append(JS.dom({ _: 'option', text: name, value: name }));
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
  var _ = ctx._,
      fn = ctx[$('#selRenamer :selected').val()],
      passMediaTags = fn.GET_MEDIA_TAGS;

  $('.trDir, .trFile').each(function(i, tr) {
    var oldPath = $('#txtOldPath' + i, tr).val(),
        file = files[i],
        jText = $('#txtNewPath' + i, tr),
        valueSetter = $('#chkPath' + i, tr).prop('checked') ? 'prop' : 'data';
    ctx._ = { path: oldPath, data: file };
    if (passMediaTags) {
      mm(fs.createReadStream(file.path), function (err, metadata) {
        jText[valueSetter]('value', fn(oldPath, file, err ? false : metadata));
      });
    }
    else {
      jText[valueSetter]('value', fn(oldPath, file));
    }
  });

  ctx._ = _;
}, 500);

$('#selRenamer').on('change', function() {
  appSettings.set('renamerIndex', this.selectedIndex);
});

function setDir(dirPath, inMaxDirDepth) {
  appSettings.set({ dirPath: dirPath, dirDepth: inMaxDirDepth });

  lastChkIndex = undefined;

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
      id: 'chkPath' + i,
      _: 'input',
      type: 'checkbox',
      checked: true,
      onfocus: function() {
        $('#trFile' + i).addClass('focus');
      },
      onblur: function() {
        $('#trFile' + i).removeClass('focus');
      },
      onclick: function(e) {
        var jNew = $('#txtNewPath' + i), jOld = $('#txtOldPath' + i);
        if (this.checked) {
          jNew.val(jNew.data('value')).attr('readonly', false);
        }
        else {
          jNew.data('value', jNew.val()).val(jOld.val()).attr('readonly', true);
        }

        if (e.shiftKey && lastChkIndex != undefined && lastChkIndex != i) {
          for (var step = lastChkIndex - i > 0 ? -1 : 1, j = lastChkIndex; (j += step) != i;) {
            $('#chkPath' + j).trigger('click');
          }
        }
        lastChkIndex = i;
        $('#trFile' + i)[this.checked ? 'removeClass' : 'addClass']('off');
      }
    }));
    JS.extend(tr.insertCell(1), {
      className: 'tdTextboxes'
    }).appendChild(JS.dom({
      _: 'table',
      cls: 'tblTextboxes',
      border: 0,
      cellPadding: 0,
      cellSpacing: 0,
      $: [
        {
          _: 'tr',
          $: [
            {
              _: 'td',
              cls: 'tdOld',
              $: [
                {
                  _: 'input',
                  type: 'text',
                  readOnly: true,
                  tabIndex: -1,
                  id: 'txtOldPath' + i,
                  value: relPath
                }
              ]
            },
            { _: 'td', html: '&rarr;', cls: 'tdArrow' },
            {
              _: 'td',
              cls: 'tdNew',
              $: [
                {
                  _: 'input',
                  type: 'text',
                  value: relPath,
                  id: 'txtNewPath' + i,
                  onkeydown: function(e) {
                    var prevAll = $('#trFile' + i).prevAll('.trDir:not(.off), .trFile:not(.off)');
                    var nextAll = $('#trFile' + i).nextAll('.trDir:not(.off), .trFile:not(.off)');
                    if (e.which == 38) {
                      $(prevAll[0] || JS.nth(nextAll, -1)).find(':text[id^=txtNewPath]').select();
                    }
                    else if (e.which == 40) {
                      $(nextAll[0] || JS.nth(prevAll, -1)).find(':text[id^=txtNewPath]').select();
                    }
                  },
                  onkeyup: function(e) {
                    if (e.which == 38 || e.which == 40) {
                      this.select();
                    }
                  },
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
    var oldPath = file.path,
        newPath = path.normalize(rootPath + path.sep + $('#txtNewPath' + i).val()),
        pathToCheck = newPath,
        pathsToCreate = [];

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

$('#btnRefreshRoot').click(function() {
  if (rootPath) {
    setDir(rootPath, maxDirDepth);
  }
});

$('#tdResizePanel').on('mousedown', function(e) {
  e.preventDefault();
  $('body').addClass('resizing-panels');
  isResizingPanels = true;
});
$('body')
  .on('mousemove', function(e) {
    if (isResizingPanels) {
      repositionSplit(Math.round(100 * (e.pageX - 5) / $('body').width()));
    }
  })
  .on('mouseup', function(e) {
    $('body').removeClass('resizing-panels');
    isResizingPanels = false;
  });

function repositionSplit(split) {
  var pct = appSettings.set('split', split);
  $('#tdLeftTopPanel, #tdLeftBottomPanel').css('width', pct + '%');
  $('#tdRightPanel').css('width', (100 - pct) + '%');
}
