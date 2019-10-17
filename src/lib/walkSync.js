import fs from 'fs';

const templateWalkSync = (dir, hasIndex) => {
    const files = fs.readdirSync(dir);
    let fileList = [];
    let indexFile = '';
    let correctionPath = '';

    files.forEach((file) => {
        if (fs.statSync(dir + '/' + file).isDirectory()) {
            const walkResult = templateWalkSync(dir + '/' + file, hasIndex || (indexFile));


            if (walkResult.indexFile) {
                indexFile = walkResult.indexFile;
                fileList = walkResult.fileList;
                correctionPath = file + '/';
            } else {
                fileList.push({[file]: walkResult.fileList});
            }
        } else {
            fileList.push(file);
            if (!hasIndex && ['index.html', 'index.htm', 'index.php'].indexOf(file) > -1) {
                indexFile = file;
            }
        }
    });

    return {fileList, indexFile, correctionPath};
};

export default templateWalkSync;