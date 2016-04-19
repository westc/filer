storeSnippet({"id":27,"name":"quoteRegExp() - Escaping RegExp Metacharacters","description":"Turn any string into a regular expression that matches the exact string without worrying about encoding the metacharacters yourself.","js":"function quoteRegExp(str, opt_flagsOrMakeRegExp) {\r\n  var ret = str.replace(\/[[\\](){}.+*^$|\\\\?-]\/g, '\\\\$&');\r\n  return opt_flagsOrMakeRegExp == '' || opt_flagsOrMakeRegExp\r\n    ? new RegExp(ret, opt_flagsOrMakeRegExp == true ? '' : opt_flagsOrMakeRegExp)\r\n    : ret;\r\n}","post":"<h2><code>quoteRegExp(...)<\/code> API Documentation<\/h2>\r\n<div style=\"margin: 0 30px 30px\">\r\n  <div>Turn any string into a regular expression that matches the exact string without worrying about encoding the metacharacters yourself.<\/div>\r\n  \r\n  <h3>Parameters<\/h3>\r\n  <ol>\r\n    <li>\r\n      <b><code>str<\/code> {string}:<\/b><br \/>\r\n      The string that should be modified so that any characters that would normally serve as metacharacters in a regular expression will be escaped.\r\n    <\/li>\r\n    <li>\r\n      <b><code>flagsOrMakeRegExp<\/code> {string|boolean}:<\/b><br \/>\r\n      Optional.  If not specified or if <code class=\"language-javascript\">false<\/code>, it will cause just the escaped version of <code>str<\/code> to be returned.  If <code class=\"language-javascript\">true<\/code>, it will be as if the empty string was passed in.  A string represents the flags to be set in the returned regular expression.\r\n    <\/li>\r\n  <\/ol>\r\n  \r\n  <h3>Returns<\/h3>\r\n  <div>If <code class=\"language-javascript\">true<\/code>, a regular expression without flags will be returned.  If this is a non-empty string, a regular expression with the specified characters representing the corresponding flags will be returned.  In all other cases just the escaped string that can be used as a regular expression will be returned.<\/div>\r\n<\/div>\r\n\r\n<h2>Example<\/h2>\r\nThanks to this snippet, you can now turn any string into a regular expression that matches the exact string without worrying about encoding the metacharacters yourself:\r\n```javascript\r\nconsole.log(YourJS.quoteRegExp('1+2^3=9' true));\r\n\/\/ -> \/1\\+2\\^3=9\/\r\n```","required_ids":{},"tags":["RegExp","String"],"variables":["quoteRegExp"]});