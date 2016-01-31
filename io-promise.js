const fs = require('fs');

module.exports = {

  /*
  ==========================================
  Validate file exists async
  return Promise => file path
  ==========================================
  */
  validateSrc(fSrc) {
    return new Promise((resolve, reject) => {
      fs.stat(fSrc, (err, stats) => {
        if(err) reject(new Error(`Source file doesn't exist: ${fSrc}`));
        resolve(fSrc);
      });
    });
  },


  /*
  ==========================================
  Validate file does not exist async
  return Promise => file path
  ==========================================
  */
  validateDest(fSrc, fDest) {
    return new Promise((resolve, reject) => {
      fs.stat(fDest, (err, stats) => {
        if(err) resolve(`Copying ${fSrc} => ${fDest}`);
        reject(new Error(`File already exists: ${fDest}`));
      });
    });
  },


  /*
  ==========================================
  Read Directory async
  return Promise => Array of files
  ==========================================
  */
  readDir(dir) {
    return new Promise((resolve, reject) => {
      fs.readdir(dir, (err, files) => {
        if(err) reject(new Error(err.message));
        resolve(files);
      });
    });
  },


  /*
  ==========================================
  Read File async
  return Promise => String
  ==========================================
  */
  readFile(file) {
    return new Promise((resolve, reject) => {
      fs.readFile(file, 'utf8', (err, data) => {
        if(err) reject(new Error(err.message));
        resolve(data);
      });
    });
  },


  /*
  ==========================================
  Write File async
  return Promise => true
  ==========================================
  */
  writeFile(file, data) {
    // return new Promise((resolve, reject) => {
      fs.writeFile(file, data, (err) => {
        if(err) reject(new Error(err.message));
        // resolve(data);
      });
    // });
  }

};
