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

  // 5. Once the stream is closed, build README
  copyFile.on('finish', () => {

    // 6. Build README
    buildReadme();
  });
})
.catch((err) => console.error(err));


function buildReadme() {

  // 1. Read in README file
  let injectionFile = io.readFile('./README.md');

  // 2. Read entry dir and send through formatting
  // This will create the content to inject
  let injection = io.readDir('./entries').then((list) => format(list));

  // 3. Resolve steps 1 & 2
  Promise.all([injectionFile, injection])
  .then((data) => {

    // 4. Create the injected content
    return inject(data[0], data[1]);
  })
  .then((injectedFile) => {

    // 5. Write the injected README
    return io.writeFile('./README.md', injectedFile);
  })
  .then(() => {

    // Push it to Github
    yolo();
  })
  .catch((err) => console.error(err));
}


/*
==========================================
Format Sync
return String
==========================================
*/
// Helpers
let leadingZero = (num) => num < 10 ? '0' + String(num) : num;
let basename = (file) => file.split('').slice(0, -3).join('');
function format(arrayOfFiles) {
  let entryNum
    , fileName;

  return arrayOfFiles.reduce((list, file, i) => {
    entryNum = leadingZero(i+1);
    fileName = basename(file);
    return list += `- [**e_${entryNum}** ${fileName}](./entries/${file})\n`;
  }, '');
}


/*
==========================================
Inject async
return Promise => injected String
==========================================
*/
function inject(stringToInject, injection) {
  return new Promise((resolve, reject) => {
    if(stringToInject.match(injectionSite)) {
      let newString = stringToInject.replace(injectionSite, `${opening}\n${injection}\n${closing}`);
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
  let add = spawn('git', ['add', dest + ' README.md']);
  let commit = spawn('git', ['commit', '-m', `add ${filename} and update README`]);
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
