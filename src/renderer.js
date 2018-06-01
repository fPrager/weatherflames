import Jimp from 'jimp';

import { generate } from './generate';
import { loadBackground } from './loadBackground';
import { loadWeatherString } from './loadWeatherString';
import { drawText } from './drawText';
import { mapSeed } from './mapSeed';

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
    console.log(`orig seed: ${weatherData.seed}`);
    const newSeed = mapSeed(weatherData.seed);
    console.log(`new seed: ${newSeed}`);

    generate({ canvas, seed: newSeed, time });
    const flame = await readCanvas(canvas);
    background.resize(flame.bitmap.width, flame.bitmap.height);
    background.brightness(0.3);
    background.composite(flame, 0, 0);
    await drawText({ image: background, data: weatherData });
    return background;
};

export const renderer = { render };

