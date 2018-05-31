import Jimp from 'jimp';
import path from 'path';

export const loadBackground = () => {
    return new Promise((resolve) => {
        Jimp.read(path.join(__dirname, '../public/natural-paper.png'), (err, image) => {
            resolve(image);
        });
    });
};

