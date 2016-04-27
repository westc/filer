storeSnippet({"id":39,"name":"trunc() - Integral Part of a Number","description":"Just gets the integral part of a number.","js":"function trunc(num) {\r\n  return Math[num < 0 ? 'ceil' : 'floor'](num);\r\n}","post":"Since we have a function to get the non-integral part of a number it only makes sense to also have a function to get the integral part of a number.\r\n\r\n<h3><code>trunc(num)<\/code> API Documentation<\/h3>\r\n<div style=\"margin: 0 30px 30px;\">\r\n  <h3>Parameters<\/h3>\r\n  <ol>\r\n    <li>\r\n      <b><code>num<\/code> {number}:<\/b><br \/>\r\n      The number for which only the integral part shall be returned.\r\n    <\/li>\r\n  <\/ol>\r\n  \r\n  <h3>Returns<\/h3>\r\n  <div>Returns the integral part of <code>num<\/code> while keeping the sign.<\/div>\r\n<\/div>","required_ids":{},"tags":["Number"],"variables":["trunc"]});