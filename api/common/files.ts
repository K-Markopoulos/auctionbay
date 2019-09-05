import fs = require('fs');
import { IFile } from '../models/files';

const move = (files: any[], path): Promise<IFile>[] => {
  !fs.existsSync(path) && fs.mkdirSync(path);
  return files.map(file => {
    const newPath =  `${path}/${file.filename}`;
    return new Promise((resolve, reject) => {
      fs.rename(file.path,newPath, (error) => {
        if (error) {
          console.log('Error on moving files');
          reject(error);
        }
        console.info(`Create new file ${newPath}`);
        resolve({ name: file.originalname, fid: file.filename });
      });
    })
  })
};

export = {
  move
}