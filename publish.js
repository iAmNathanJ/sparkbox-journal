'use strict';

let fs = require('fs');

function read(src, dest) {
  return new Promise((resolve, reject) => {
    fs.readFile(src, 'utf8', (err, contents) => {
      if(err) reject(new Error(err));
      resolve(contents);
    });
  });
}
