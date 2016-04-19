storeSnippet({"id":57,"name":"map() - Map Array\/Object Values","description":"Creates a new array or object with the same keys while getting the new values from the specified function.","js":"function map(arrOrObj, fn, opt_mapAll) {\r\n  var ret = isArrayLike(arrOrObj) ? [] : {};\r\n  walk(arrOrObj, function(v, k) {\r\n    ret[k] = fn.apply(this, arguments);\r\n  }, opt_mapAll);\r\n  return ret;\r\n}","post":"<h2><code>map(...)<\/code> API Documentation<\/h2>\r\n<div style=\"margin: 0 30px 30px;\">\r\n    <h3>Description<\/h3>\r\n    <div>Creates a new array or object with the same keys while getting the new values from the specified function.<\/div>\r\n    \r\n    <h3>Parameters<\/h3>\r\n    <ol>\r\n        <li>\r\n            <b><code>arrOrObj<\/code> {Array|Object}:<\/b><br \/>\r\n            The array or object that is to be traversed.\r\n        <\/li>\r\n        <li>\r\n            <b><code>fn<\/code> {function(value, key, arrOrObj)}:<\/b><br \/>\r\n            The callback to be called for each value in the array or object.  The value returned will be stored as the property in the newly created array or object that is returned by <code>YourJS.map()<\/code>.\r\n        <\/li>\r\n        <li>\r\n            <b><code>opt_mapAll<\/code> {boolean}:<\/b><br \/>\r\n            Optional.  Defaults to <code>false<\/code>.  If <code>true<\/code> all array keys or object properties will be traversed even if they aren't owned by <code>arrOrObj<\/code> (which is determined by <code>hasOwnProperty()<\/code>.\r\n        <\/li>\r\n    <\/ol>\r\n    \r\n    <h3>Returns<\/h3>\r\n    <div>Returns the new array or object that contains the values returned from <code>fn<\/code> for each index\/key that was traversed.<\/div>\r\n<\/div>","required_ids":{"20":"walk() - Traverse Array\/Object Values","81":"isArrayLike() & toArray()"},"tags":["Array","Function","Object"],"variables":["map"]});