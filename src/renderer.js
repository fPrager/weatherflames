import Jimp from 'jimp';

import { generate } from './generate';
import { loadBackground } from './loadBackground';
import { loadWeatherString } from './loadWeatherString';
import { drawText } from './drawText';

const readCanvas = (canvas) => {
    return new Promise((resolve) => {
        Jimp.read(canvas.toBuffer(), (err, result) => {
            resolve(result);
        });
    });
};

const render = async (canvas, options) => {
    const weatherData = await loadWeatherString(options);
    const background = await loadBackground();
    const time = (new Date()).getHours() / 24;
    generate({ canvas, seed: weatherData.seed, time });
    const flame = await readCanvas(canvas);
    background.resize(flame.bitmap.width, flame.bitmap.height);
    background.brightness(0.3);
    background.composite(flame, 0, 0);
    await drawText({ image: background, data: weatherData });
    return background;
};

export const renderer = { render };

