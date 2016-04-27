storeSnippet({"id":24,"name":"uniquify()","description":"Creates a new version of an array in which each value is unique.","js":"function uniquify(anArray) {\r\n  anArray = slice(anArray);\r\n  for (var e1, i1 = 0, l = anArray.length; i1 < l; i1++) {\r\n    e1 = anArray[i1];\r\n    for (i2 = i1 + 1; i2 < l; i2++) {\r\n      if (e1 === anArray[i2]) {\r\n        l--;\r\n        anArray.splice(i2--, 1);\r\n      }\r\n    }\r\n  }\r\n  return anArray;\r\n}","post":"If you want to get only the unique elements in an array you can use <code>YourJS.uniquify(...)<\/code>.\r\n\r\n<h2><code>uniquify(...)<\/code> API Documentation<\/h2>\r\n<div style=\"margin: 0 30px 30px\">\r\n  <h3>Parameters<\/h3>\r\n  <ol>\r\n    <li>\r\n      <b><code>anArray<\/code> {Array}:<\/b><br \/>\r\n      The array which will be duplicated and returned without any duplicate values.\r\n    <\/li>\r\n  <\/ol>\r\n  \r\n  <h3>Returns<\/h3>\r\n  <div>Returns a copy of <code>anArray<\/code> with each value only appearing one time.<\/div>\r\n<\/div>","required_ids":{},"tags":["Array"],"variables":["uniquify"]});