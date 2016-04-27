storeSnippet({"id":66,"name":"String Padding - ES7 Style","description":"Pads a string make sure that it is always at least a specific length.","js":"function padStart(str, maxLength, opt_fillString) {\r\n  str += '';\r\n\r\n  var filler, fillLen, stringLength = str.length;\r\n\r\n  return maxLength > stringLength\r\n    ? (\r\n        filler = (opt_fillString !== undefined ? opt_fillString + '' : '') || ' ',\r\n        fillLen = maxLength - stringLength,\r\n        (new Array(Math.ceil(fillLen \/ filler.length) + 1)).join(filler).slice(0, fillLen) + str\r\n      )\r\n    : str;\r\n}\r\n\r\nfunction padEnd(str, maxLength, opt_fillString) {\r\n  str += '';\r\n\r\n  var filler, fillLen, stringLength = str.length;\r\n\r\n  return maxLength > stringLength\r\n    ? (\r\n        filler = (opt_fillString !== undefined ? opt_fillString + '' : '') || ' ',\r\n        fillLen = maxLength - stringLength,\r\n        str + (new Array(Math.ceil(fillLen \/ filler.length) + 1)).join(filler).slice(0, fillLen)\r\n      )\r\n    : str;\r\n}","post":"It has been proposed that in ES7 two new `String` prototype functions be defined:\r\n\r\n* `String.prototype.padStart(maxLength, [fillString])`\r\n* `String.prototype.padEnd(maxLength, [fillString])`\r\n\r\nThis snippet makes this functionality available today using these functions:\r\n\r\n* `YourJS.padStart(str, maxLength, [opt_fillString])`\r\n* `YourJS.padEnd(str, maxLength, [opt_fillString])`\r\n\r\n<h2><code>padStart(...)<\/code> API Documentation<\/h2>\r\n<div style=\"margin: 0 30px 30px;\">\r\n  <h3>Description<\/h3>\r\n  <div>Prepends a string with a filler string so that the length of the string is always at least a certain length.<\/div>\r\n  \r\n  <h3>Parameters<\/h3>\r\n  <ol>\r\n    <li>\r\n      <b><code>str<\/code> {string}:<\/b><br \/>\r\n      The string to prepend a filler string to.\r\n    <\/li>\r\n    <li>\r\n      <b><code>maxLength<\/code> {number}:<\/b><br \/>\r\n      The maximum length allowed for the returned string.  If this is less than <code>str.length<\/code>, this will be set to <code>str.length<\/code>.\r\n    <\/li>\r\n    <li>\r\n      <b><code>opt_fillString<\/code> {string=}:<\/b><br \/>\r\n      Optional.  Defaults to <code>\" \"<\/code>.  The string to repeatedly prepend to <code>str<\/code> until the length reaches <code>maxLength<\/code>.\r\n    <\/li>\r\n  <\/ol>\r\n  \r\n  <h3>Returns<\/h3>\r\n  <div>Returns <code>str<\/code> with the filler string prepended to it as many times as necessary until <code>maxLength<\/code> is reached.<\/div>\r\n<\/div>\r\n\r\n<h2><code>padEnd(...)<\/code> API Documentation<\/h2>\r\n<div style=\"margin: 0 30px 30px;\">\r\n  <h3>Description<\/h3>\r\n  <div>Appends a string with a filler string so that the length of the string is always at least a certain length.<\/div>\r\n  \r\n  <h3>Parameters<\/h3>\r\n  <ol>\r\n    <li>\r\n      <b><code>str<\/code> {string}:<\/b><br \/>\r\n      The string to append a filler string to.\r\n    <\/li>\r\n    <li>\r\n      <b><code>maxLength<\/code> {number}:<\/b><br \/>\r\n      The maximum length allowed for the returned string.  If this is less than <code>str.length<\/code>, this will be set to <code>str.length<\/code>.\r\n    <\/li>\r\n    <li>\r\n      <b><code>opt_fillString<\/code> {string=}:<\/b><br \/>\r\n      Optional.  Defaults to <code>\" \"<\/code>.  The string to repeatedly append to <code>str<\/code> until the length reaches <code>maxLength<\/code>.\r\n    <\/li>\r\n  <\/ol>\r\n  \r\n  <h3>Returns<\/h3>\r\n  <div>Returns <code>str<\/code> with the filler string appended to it as many times as necessary until <code>maxLength<\/code> is reached.<\/div>\r\n<\/div>","required_ids":{},"tags":["ES6\/7","String"],"variables":["padEnd","padStart"]});