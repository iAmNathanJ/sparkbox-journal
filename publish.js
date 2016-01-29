'use strict';

let fs    = require('fs')
  , path  = require('path')
  , spawn = require('child_process').spawn
  , read  = fs.createReadStream
  , write = fs.createWriteStream;

let file      = process.argv[2]
  , filename  = path.basename(file)
  , dest      = `./entries/${filename}`;

const esc = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

validateSrc(file)
.then((src) => {
  return validateDest(src, dest);
})
.then((msg) => {

  // Status message
  console.log(msg);

  // Copy the file
  let fileStream = read(file)
  .pipe(write(dest));

  // Push to github
  fileStream.on('finish', () => {
    yolo();
  });
})
.catch((err) => {
  console.log(err);
});

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

function yolo() {
  let add = spawn('git', ['add', dest]);
  let commit = spawn('git', ['commit', '-m', `add ${filename}`]);
  let push = spawn('git', ['push']);
  [add, commit, push].forEach((cmd) => {
    cmd.stdout.on('data', (data) => {
      console.log(`${data}`);
    });
  });
}

function inject(file, injection) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, contents) => {
      if(err) reject(new Error(err.message));
      let opening = '<!-- inject -->', closing = '<-- /inject -->';
      // let injectionSite = new RegExp(/^(opening)/ + /asd/ + /(closing)$/);
      resolve(contents.replace(/^(<!-- inject -->)[\w\W]*(<-- \/inject -->)$/ig, `${opening}\nHELLO\n\n${closing}));
    });
  });
}

// TODO
// - improve file validation (fs.access)
// - allow overwriting
// - add injection functionality
