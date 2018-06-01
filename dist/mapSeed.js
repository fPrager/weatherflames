'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.mapSeed = undefined;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mapSeed = exports.mapSeed = function mapSeed(seed) {
    return new _promise2.default(function (resolve) {
        if (!process.env.SEED_MAP_URL) {
            console.log('using local seed map');
            var map = JSON.parse(_fs2.default.readFileSync(_path2.default.join(__dirname, '../public/sampleSeedMap.json')));
            resolve(map[seed] || seed);
            return;
        }
        (0, _request2.default)(process.env.SEED_MAP_URL, function (error, res) {
            if (!error && res.statusCode === 200) {
                var _map = JSON.parse(res.body);
                resolve(_map[seed] || seed);
            } else {
                console.log('cant read reach online seed map');
                var _map2 = JSON.parse(_fs2.default.readFileSync(_path2.default.join(__dirname, '../public/sampleSeedMap.json')));
                resolve(_map2[seed] || seed);
            }
        });
    });
};