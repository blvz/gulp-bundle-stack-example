var fs = require('fs');

var catPoem = fs.readFileSync(__dirname + '/support/cat-poem.txt', 'utf8');
var dogPoem = fs.readFileSync(__dirname + '/support/dog-poem.txt', 'utf8');

console.log('CAT POEM', catPoem);
console.log('DOG POEM', dogPoem);
