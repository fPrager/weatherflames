const Jimp = require('jimp');
const Canvas = require('canvas');
const { renderer } = require('./dist/renderer');

const processImage = (image) => {
    return new Promise(((resolve) => {
        image
            .resize(800, 600);
        // .greyscale();
        resolve(image);
    }));
};


const canvas = new Canvas(1240, 960);
const render = () => {
    const filename = 'output/test.png';
    renderer.render(canvas, { seed: 'bam', time: 0 });
    Jimp.read(canvas.toBuffer(), (err, result) => {
        processImage(result).then((image) => {
            image.write(filename);
        });
    });
};

render();
