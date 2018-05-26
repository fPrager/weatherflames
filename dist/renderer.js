'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.renderer = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _generate = require('./generate');

var render = function render(canvas, options) {
    (0, _generate.generate)(_extends({}, options, { canvas: canvas }));
};

var renderer = exports.renderer = { render: render };