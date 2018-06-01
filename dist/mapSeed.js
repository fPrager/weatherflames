'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.mapSeed = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mapSeed = exports.mapSeed = function mapSeed(seed) {
    var map = JSON.parse(_fs2.default.readFileSync(_path2.default.join(__dirname, '../public/sampleSeedMap.json')));
    return map[seed] || seed;
};