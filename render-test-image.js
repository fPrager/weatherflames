const fs = require('fs');
const Jimp = require('jimp');
const Canvas = require('canvas');
const PNG = require('pngjs').PNG;
const videoshow = require('videoshow');


const getBuffer = (image) => {
    return new Promise(((resolve, reject) => {
        image.getBuffer(Jimp.MIME_PNG, (err, data) => { // Add err
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    }));
};


const processImage = (image) => {
    return new Promise(((resolve) => {
        image.resize(800, 600)
            .greyscale();
        resolve(image);
    }));
};

const { renderer, } = require('./dist/renderer');

const canvas = new Canvas(1240, 960);
const render = () => {
    const filename = 'output/test.png';
    renderer.render(canvas, { seed: 'bam', time: 0, });
    Jimp.read(canvas.toBuffer(), (err, result) => {
        processImage(result).then((image) => {
            image.write(filename);
        });
    });
};

render();
