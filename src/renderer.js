import { generate, } from './generate';

const render = (canvas, options) => {
    generate({ ...options, canvas, });
};

export const renderer = { render, };

