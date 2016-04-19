storeSnippet({"id":87,"name":"nthIndexOf() - Find the Nth Occurrence Of A Target","description":"Find the nth occurrence of a target within an array (or array-like object), a string or an object, going in order or in reverse order.","js":"function nthIndexOf(subject, target, n) {\r\n  var i, tLen,\r\n      indices = [],\r\n      nIsNegative = n < 0,\r\n      fnName = (nIsNegative ? 'lastI' : 'i') + 'ndexOf',\r\n      l = subject.length,\r\n      increment = nIsNegative ? -1 : 1;\r\n  if (n = ~~n) {\r\n    if (isArrayLike(subject)) {\r\n      for (i = nIsNegative ? l - 1 : 0; nIsNegative ? i >= 0 : (i < l); i += increment) {\r\n        if (target === subject[i] && !(n -= increment)) {\r\n          return i;\r\n        }\r\n      }\r\n      return -1;\r\n    }\r\n    else if (typeOf(subject, 'String')) {\r\n      if (typeOf(target, 'RegExp')) {\r\n        target = flagRegExp(target, 'g');\r\n        subject.replace(target, function(a) {\r\n          a = arguments;\r\n          indices.push(a[a.length - 2]);\r\n        });\r\n        return increment * n <= indices.length ? indices.slice(nIsNegative ? n : ~-n)[0] : -1;\r\n      }\r\n      else {\r\n        subject = subject.split(target);\r\n        return subject[n * increment] != undefined ? subject.slice(0, n).join(target).length : -1;\r\n      }\r\n    }\r\n    else {\r\n      for (i in subject) {\r\n        if (target === subject[i]) {\r\n          n -= increment;\r\n          if (nIsNegative) {\r\n            indices.push(i);\r\n          }\r\n          else if (!n) {\r\n            return i;\r\n          }\r\n        }\r\n      }\r\n      if (n < indices.length) {\r\n        return indices[n];\r\n      }\r\n    }\r\n  }\r\n}","post":"<h2><code>nthIndexOf(...) API Documentation<\/code><\/h2>\r\n<div style=\"margin: 0 30px 30px\">\r\n  <div>Find the nth occurrence of a target within an array (or array-like object), a string or an object, going in order or in reverse order.<\/div>\r\n  \r\n  <h3>Parameters<\/h3>\r\n  <ol>\r\n    <li>\r\n      <b><code>subject<\/code> {Array|Object|string}:<\/b><br \/>\r\n      The array (or array-like object), string or object to traverse in order to find the index of the n<sup>th<\/sup> occurrence of <code>target<\/code>.\r\n    <\/li>\r\n    <li>\r\n      <b><code>target<\/code> {*}:<\/b><br \/>\r\n      <ul>\r\n        <li>If <code>subject<\/code> is a <code>string<\/code>, this can either be a  <code>RegExp<\/code> or a <code>string<\/code>.  If this is a <code>RegExp<\/code> it will be used to find all of the matching substrings by adding the <code>global<\/code> flag to its clone.  If this is a <code>string<\/code>, this substring will be searched for within <code>subject<\/code>.<\/li>\r\n        <li>If <code>subject<\/code> is a <code>Array<\/code> (or <code>Array<\/code>-like) or an <code>Object<\/code>, this can be anything for which to search for within <code>subject<\/code> at each index (or key).<\/li>\r\n      <\/ul>\r\n    <\/li>\r\n    <li>\r\n      <b><code>n<\/code> {number}:<\/b><br \/>\r\n      If this is a positive number it represents the number of the occurrence going from beginning to end for which the index (or key) should be returned.  If this is a negative number it represents the occurrence going from end to beginning for which the index (or key) should be returned.  NOTE:  If this is not a finite number other than <code>0<\/code> the returned value will be <code>undefined<\/code>.\r\n    <\/li>\r\n  <\/ol>\r\n  \r\n  <h3>Returns<\/h3>\r\n  <div>If searching a string or an array and the n<sup>th<\/sup> occurrence is found the index at which that occurrence of <code>subject<\/code> is found will be returned.  If searching a string or an array and the n<sup>th<\/sup> occurrence isn't found <code>-1<\/code> will be returned.  If searching an object which is not array-like and the occurrence is found the corresponding key will be returned.  In all other cases <code>undefined<\/code> will be returned.  If <code>n<\/code> is not a finite number other than <code>0<\/code>, <code>undefined<\/code> will be returned.<\/div>\r\n<\/div>","required_ids":{"28":"flagRegExp() - Modify RegExp Flags","81":"isArrayLike() & toArray()"},"tags":["Array","Object","RegExp","String"],"variables":["nthIndexOf"]});