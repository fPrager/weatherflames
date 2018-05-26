export const lerp = (a, b, x) => {
    return a + ((b - a) * x);
};

export const map = (x, xStart, xStop, yStart, yStop) => {
    return lerp(yStart, yStop, (x - xStart) / (xStop - xStart));
};

export const sampleArray = (a) => {
    return a[Math.floor(Math.random() * a.length)];
};
