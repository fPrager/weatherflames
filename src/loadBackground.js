import Jimp from 'jimp';

export const loadBackground = () => {
    return new Promise((resolve) => {
        Jimp.read('public/natural-paper.png', (err, image) => {
            resolve(image);
        });
    });
};

