var hey = require('./lib/hey'),
    ho  = require('./lib/ho'),
    oh  = require('./lib/bil/oh'),
    yeh = require('./lib/bil/yeh');

var fn, arr = [hey, ho, oh, yeh];
while(fn = arr.shift()) { fn(); }
