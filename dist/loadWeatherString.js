'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.loadWeatherString = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var requestWeather = function requestWeather(data) {
    return new _promise2.default(function (resolve, reject) {
        _https2.default.get({
            hostname: 'api.darksky.net',
            path: '/forecast/' + data.darkKey + '/' + data.lat + ',' + data.lon + '?units=ca',
            method: 'GET'
        }, function (res) {
            var body = '';
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                resolve(JSON.parse(body));
            });
            res.on('error', function (e) {
                reject(e);
            });
        });
    });
    // const darksky = new DarkSky(data.darkKey);


    /* console.log(data);
    return darksky
        .coordinates({ lat: `${data.lat}`, lng: `${data.lon}` })
        .language('en')
        .units('de')
        .get(); */
};

var loadWeatherString = exports.loadWeatherString = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref2$lat = _ref2.lat,
            lat = _ref2$lat === undefined ? 40.3482922 : _ref2$lat,
            _ref2$lon = _ref2.lon,
            lon = _ref2$lon === undefined ? -74.7398824 : _ref2$lon,
            darkKey = _ref2.darkKey;

        var weather;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (!(darkKey === undefined)) {
                            _context.next = 2;
                            break;
                        }

                        return _context.abrupt('return', {
                            summary: 'Missing DarkSky-API-Key',
                            tempMin: 0,
                            tempMax: 0,
                            seed: 's' + Math.random()
                        });

                    case 2:
                        _context.prev = 2;
                        _context.next = 5;
                        return requestWeather({ lat: lat, lon: lon, darkKey: darkKey });

                    case 5:
                        weather = _context.sent;
                        return _context.abrupt('return', {
                            summary: weather.hourly.summary,
                            tempMin: Math.round(weather.daily.data[0].temperatureLow),
                            tempMax: Math.round(weather.daily.data[0].temperatureHigh),
                            seed: weather.hourly.icon
                        });

                    case 9:
                        _context.prev = 9;
                        _context.t0 = _context['catch'](2);
                        return _context.abrupt('return', {
                            summary: _context.t0,
                            tempMin: 0,
                            tempMax: 0,
                            seed: 's' + Math.random()
                        });

                    case 12:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined, [[2, 9]]);
    }));

    return function loadWeatherString() {
        return _ref.apply(this, arguments);
    };
}();