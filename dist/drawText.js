'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.drawText = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _jimp = require('jimp');

var _jimp2 = _interopRequireDefault(_jimp);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var drawRectangle = function drawRectangle(image, x1, x2, y1, y2) {
    for (var x = x1; x < x2; x += 1) {
        for (var y = y1; y < y2; y += 1) {
            image.setPixelColor(0x000000FF, x, y);
        }
    }
};

var drawText = exports.drawText = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref) {
        var image = _ref.image,
            data = _ref.data;
        var font, estimatedTextLenght, estimatedTextHeight, y, x, linewidth, lineX, lineYPos, tempText, estimatedTempLength, tempX;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return _jimp2.default.loadFont(_path2.default.join(__dirname, '../public/font.fnt'));

                    case 2:
                        font = _context.sent;

                        // console.log(font);
                        estimatedTextLenght = data.summary.length * 16;
                        estimatedTextHeight = 25;
                        y = image.bitmap.height - 130;
                        x = image.bitmap.width / 2 - estimatedTextLenght / 2;

                        image.print(font, x, y, data.summary);
                        linewidth = image.bitmap.width * 0.6;
                        lineX = image.bitmap.width / 2 - linewidth / 2;
                        lineYPos = y + estimatedTextHeight + 10;

                        drawRectangle(image, lineX, lineX + linewidth, lineYPos, lineYPos + 2);

                        tempText = data.tempMin + '.';
                        estimatedTempLength = tempText.length * 16;

                        tempText += '' + data.tempMax;
                        tempX = image.bitmap.width / 2 - estimatedTempLength;

                        image.print(font, tempX, lineYPos + 12, tempText);

                    case 17:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function drawText(_x) {
        return _ref2.apply(this, arguments);
    };
}();