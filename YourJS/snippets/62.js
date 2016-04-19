storeSnippet({"id":62,"name":"Setting Default Values for Functions","description":"","js":"function setDefaults(fn) {\r\n  var defaults = slice(arguments, 1);\r\n  return function() {\r\n    var args = slice(arguments), i = args.length;\r\n    for (args = args.concat(slice(defaults, i)); i--;) {\r\n      if (args[i] === undefined) {\r\n        args[i] = defaults[i];\r\n      }\r\n    }\r\n    return fn.apply(this, args);\r\n  };\r\n}","post":"In ES6, the ability to set default parameters has finally been added to JavaScript:\r\n```javascript\r\nfunction sayHello(name = \"world\") {\r\n  alert(\"Hello \" + name + \"!\");\r\n}\r\n```\r\n\r\nUnfortunately, not all environments support this behavior so an alternative is to use <code>YourJS.setDefaults(fn, ...defaults)<\/code>:\r\n```javascript\r\nvar sayHello = YourJS.setDefaults(function(name) {\r\n  alert(\"Hello \" + name + \"!\");\r\n}, \"world\");\r\n```\r\n\r\nOne difference between this workaround and the ES6 solution is the fact that the defaults are evaluated every time in ES6 whereas they are executed once and only once in this version.  Therefore this solution works more like the default parameters of Python.\r\n\r\n<h2><code>setDefaults()<\/code> API Documentation<\/h2>\r\n<div style=\"margin: 0 30px 30px\">\r\n  <h3>Description<\/h3>\r\n  <div>Sets the default value of each specified parameter in the given function.<\/div>\r\n  \r\n  <h3>Parameters<\/h3>\r\n  <ol>\r\n    <li>\r\n      <b><code>fn<\/code> {Function}:<\/b><br \/>\r\n      The function whose default parameters will be set.\r\n    <\/li>\r\n    <li>\r\n      <b><code>...defaults<\/code> {...*}:<\/b><br \/>\r\n      Each subsequent parameter will be used as the default parameter for <code>fn<\/code>.\r\n    <\/li>\r\n  <\/ol>\r\n  \r\n  <h3>Returns<\/h3>\r\n  <div>Returns a function whose default parameters are set with those passed in as <code>...defaults<\/code>.  NOTE:  If <code>undefined<\/code> is passed into this returned function, the default value will be used instead.<\/div>\r\n<\/div>","required_ids":{},"tags":[],"variables":["setDefaults"]});