export const lerp = (a, b, x) => {
    return a + ((b - a) * x);
};

export const map = (x, xStart, xStop, yStart, yStop) => {
    return lerp(yStart, yStop, (x - xStart) / (xStop - xStart));
};

export const sampleArray = (a) => {
    return a[Math.floor(Math.random() * a.length)];
};

export const triangleWaveApprox = (t) => {
    return 8 / (Math.PI * Math.PI) * (Math.sin(t) - (1 / 9) * Math.sin(3 * t) + (1 / 25) * Math.sin(5 * t));
};
