'use strict';

let fs    = require('fs')
  , path  = require('path')
  , read  = fs.createReadStream
  , write = fs.createWriteStream;

let file      = process.argv[2]
  , filename  = path.basename(file)
  , dest      = `./entries/${filename}`;


function validateSrc(fSrc) {
  return new Promise((resolve, reject) => {
    fs.stat(fSrc, (err, stats) => {
      if(err) reject(new Error(`Source file doesn't exist: ${fSrc}`));
      resolve(fSrc);
    });
  });
}

function validateDest(fSrc, fDest) {
  return new Promise((resolve, reject) => {
    fs.stat(fDest, (err, stats) => {
      if(err) resolve(`Copying ${fSrc} => ${fDest}`);
      reject(new Error(`File already exists: ${fDest}`));
    });
  });
}

validateSrc(file)
.then((src) => {
  return validateDest(src, dest);
})
.then((msg) => {
  console.log(msg);
  read(file)
  .pipe(write(dest));
})
.catch((err) => {
  console.log(err);
});

// clean up draft
