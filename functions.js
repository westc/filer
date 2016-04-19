this['Correct Seasons & Episodes'] = function(path, data) {
  return path
    .replace(/S(?:eason )?0*(\d+) ?E(?:pisode(s?) )?0*(\d+)/i, 'Season $1 - Episode$2 $3')
    .replace(/\/(Season )/i, ' - $1')
    .replace(/\/([\S\s]+?) (?:- )?Season (\d+)/i, '/$1/Season $2')
    .replace(/\/Season (\d+) (?:- )Episode(s?) (\d+)/i, '/Season $1/Episode$2 $3');
};  

(this['MP3/MP4 - Use Embedded Title'] = function(path, data, tags) {
  return tags && tags.title ? path.replace(/[^\/]+(?=\.\w+$)/, tags.title) : path;
}).GET_MEDIA_TAGS = true;

this['Custom'] = function(path) {
  return path.replace('Episode 0', 'Episode ');
};

this['Replace Dashes'] = function(path) {
  return path.replace(/-/g, '–');
};