'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.renderer = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _jimp = require('jimp');

var _jimp2 = _interopRequireDefault(_jimp);

var _generate = require('./generate');

var _loadBackground = require('./loadBackground');

var _loadWeatherString = require('./loadWeatherString');

var _drawText = require('./drawText');

var _mapSeed = require('./mapSeed');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var readCanvas = function readCanvas(canvas) {
    return new _promise2.default(function (resolve) {
        _jimp2.default.read(canvas.toBuffer(), function (err, result) {
            resolve(result);
        });
    });
};

var render = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(canvas, options) {
        var weatherData, background, time, newSeed, flame;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return (0, _loadWeatherString.loadWeatherString)(options);

                    case 2:
                        weatherData = _context.sent;
                        _context.next = 5;
                        return (0, _loadBackground.loadBackground)();

                    case 5:
                        background = _context.sent;
                        time = options.time || new Date().getHours() / 24;

                        console.log('orig seed: ' + weatherData.seed);
                        _context.t0 = options.seed;

                        if (_context.t0) {
                            _context.next = 13;
                            break;
                        }

                        _context.next = 12;
                        return (0, _mapSeed.mapSeed)(weatherData.seed);

                    case 12:
                        _context.t0 = _context.sent;

                    case 13:
                        newSeed = _context.t0;

                        console.log('new seed: ' + newSeed);

                        (0, _generate.generate)((0, _extends3.default)({}, options, { canvas: canvas, seed: newSeed, time: time
                        }));
                        _context.next = 18;
                        return readCanvas(canvas);

                    case 18:
                        flame = _context.sent;

                        background.resize(flame.bitmap.width, flame.bitmap.height);
                        background.brightness(0.3);
                        background.composite(flame, 0, 0);
                        _context.next = 24;
                        return (0, _drawText.drawText)({ image: background, data: weatherData });

                    case 24:
                        return _context.abrupt('return', background);

                    case 25:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function render(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

var renderer = exports.renderer = { render: render };