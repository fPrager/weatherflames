'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.loadBackground = undefined;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _jimp = require('jimp');

var _jimp2 = _interopRequireDefault(_jimp);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loadBackground = exports.loadBackground = function loadBackground() {
    return new _promise2.default(function (resolve) {
        _jimp2.default.read(_path2.default.join(__dirname, '../public/natural-paper.png'), function (err, image) {
            resolve(image);
        });
    });
};