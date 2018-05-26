"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var lerp = exports.lerp = function lerp(a, b, x) {
    return a + (b - a) * x;
};

var map = exports.map = function map(x, xStart, xStop, yStart, yStop) {
    return lerp(yStart, yStop, (x - xStart) / (xStop - xStart));
};

var sampleArray = exports.sampleArray = function sampleArray(a) {
    return a[Math.floor(Math.random() * a.length)];
};