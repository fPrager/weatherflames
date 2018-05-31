'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createSuperPoint = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _three = require('three');

var THREE = _interopRequireWildcard(_three);

var _branch = require('./branch');

var _transforms = require('./transforms');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import { UpdateVisitor } from './updateVisitor';

var globalSubtreeIterationIndex = 0;

var createSuperPoint = exports.createSuperPoint = function createSuperPoint(point, color, rootGeometry, branches) {
    var children = void 0;
    var lastPoint = new THREE.Vector3();

    var constructor = function constructor() {
        lastPoint.copy(point);
        rootGeometry.vertices.push(point);
        rootGeometry.colors.push(color);
    };

    constructor();

    return {
        point: point,
        color: color,
        children: children,
        lastPoint: lastPoint,
        rootGeometry: rootGeometry,
        updateSubtree: function updateSubtree(depth) {
            var _this = this;

            if (depth === 0) {
                return;
            }

            if (children === undefined) {
                children = branches.map(function () {
                    return createSuperPoint(new THREE.Vector3(), new THREE.Color(0, 0, 0), _this.rootGeometry, branches);
                });
            }

            for (var _len = arguments.length, visitors = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                visitors[_key - 1] = arguments[_key];
            }

            for (var idx = 0, l = children.length; idx < l; idx += 1) {
                globalSubtreeIterationIndex += 1;
                var child = children[idx];
                var branch = branches[idx];

                // reset the child's position to your updated position so it's ready to get stepped
                child.lastPoint.copy(child.point);
                child.point.copy(point);
                child.color.copy(color);

                (0, _branch.applyBranch)(branch, child.point, child.color);

                // take far away points and move them into the center
                // again to keep points from getting too out of hand
                if (child.point.lengthSq() > 50 * 50) {
                    _transforms.VARIATIONS.Spherical(child.point);
                }

                if (globalSubtreeIterationIndex % 307 === 0) {
                    for (var i = 0; i < visitors.length; i += 1) {
                        visitors[i].visit(child);
                    }
                }

                child.updateSubtree.apply(child, [depth - 1].concat((0, _toConsumableArray3.default)(visitors)));
            }
        },
        recalculate: function recalculate(initialX, initialY, initialZ, depth) {
            globalSubtreeIterationIndex = 0;
            this.point.set(initialX, initialY, initialZ);
            // console.time("updateSubtree");

            for (var _len2 = arguments.length, visitors = Array(_len2 > 4 ? _len2 - 4 : 0), _key2 = 4; _key2 < _len2; _key2++) {
                visitors[_key2 - 4] = arguments[_key2];
            }

            this.updateSubtree.apply(this, [depth].concat((0, _toConsumableArray3.default)(visitors)));
            // console.timeEnd("updateSubtree");
            this.rootGeometry.verticesNeedUpdate = true;
        }
    };
};