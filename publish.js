'use strict';

const fs = require('fs')
    , path = require('path')
    , spawn = require('child_process').spawn
    , read = fs.createReadStream
    , write = fs.createWriteStream
    , io = require('./io-promise.js');


/*
==========================================
File to publish
==========================================
*/
const file = process.argv[2]
    , filename = path.basename(file)
    , dest = `./entries/${filename}`;


/*
==========================================
Regex helpers
==========================================
*/
const esc = (s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    , opening = '<!-- inject -->'
    , closing = '<!-- /inject -->'
    , injectionSite = new RegExp(esc(opening) + '(.|\n)*' + esc(closing), 'g');


/*
==========================================
Do work
==========================================
*/
// 1. Confirm the source file exists
io.validateSrc(file)
.then((src) => {

  // 2. Confirm the destination file doesn't exist
  // Don't overwrite
  return io.validateDest(src, dest);
})
.then((msg) => {

  // 3. Send a status message
  console.log(msg);

  // 4. Copy the source file to the destination
  let copyFile = read(file).pipe(write(dest));

  // 5. Once the stream is closed, push it up
  copyFile.on('finish', () => {
    yolo();
  });
})
.catch((err) => {
  console.log(err);
});


/*
==========================================
Inject async
return Promise => injected String
==========================================
*/
function inject(stringToInject, injection) {
  return new Promise((resolve, reject) => {
    if(stringToInject.match(injectionSite)) {
      let newString = stringToInject.replace(injectionSite, `${opening}\n${injection}\n\n${closing}`);
      resolve(newString);
    } else {
      reject(new Errror('No injection site found in file.'));
    }
  });
}


/*
==========================================
Push to Github
==========================================
*/
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

// TODO
// - improve file validation (fs.access)
// - allow overwriting
// - add injection functionality
