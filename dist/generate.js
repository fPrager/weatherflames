'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.generate = undefined;

var _maxSafeInteger = require('babel-runtime/core-js/number/max-safe-integer');

var _maxSafeInteger2 = _interopRequireDefault(_maxSafeInteger);

var _minSafeInteger = require('babel-runtime/core-js/number/min-safe-integer');

var _minSafeInteger2 = _interopRequireDefault(_minSafeInteger);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _three = require('three');

var THREE = _interopRequireWildcard(_three);

var _math = require('./math');

var _transforms = require('./common/flame/transforms');

var _superPoint = require('./common/flame/superPoint');

var _updateVisitor = require('./common/flame/updateVisitor');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var geometry = void 0;
var globalBranches = void 0;
var superPoint = void 0;
var jumpiness = 3;
var boundingSphere = void 0;

var objectValueByIndex = function objectValueByIndex(obj, index) {
    var keys = (0, _keys2.default)(obj);
    return obj[keys[index % keys.length]];
};

var stringHash = function stringHash(s) {
    var hash = 0;
    var char = void 0;
    if (s.length === 0) {
        return hash;
    }
    for (var i = 0, l = s.length; i < l; i += 1) {
        char = s.charCodeAt(i);
        hash = hash * 31 + char;
        // hash |= 0; // Convert to 32bit integer
    }
    hash *= hash * 31;
    return hash;
};

var computeDepth = function computeDepth() {
    // points at exactly depth d = b^d
    // points from depth 0...d = b^0 + b^1 + b^2 + ... b^d
    // we want total points to be ~120k, so
    // 120k = b^0 + b^1 + ... + b^d
    // only the last level really matters - the last level accounts for at least
    // half of the total sum (except for b = 1)
    var depth = globalBranches.length === 1 ? 1000 : Math.floor(Math.log(100000) / Math.log(globalBranches.length));
    // just do depth 1k to prevent call stack
    return depth;
};

var animate = function animate() {
    var velocityVisitor = (0, _updateVisitor.createVelocityTrackerVisitor)();
    var varianceVisitor = (0, _updateVisitor.createLengthVarianceTrackerVisitor)();
    var countVisitor = (0, _updateVisitor.createBoxCountVisitor)([1, 0.1, 0.01, 0.001]);
    superPoint.recalculate(jumpiness, jumpiness, jumpiness, computeDepth(), velocityVisitor, varianceVisitor, countVisitor);
    if (boundingSphere == null) {
        geometry.computeBoundingSphere();
        var _geometry = geometry;
        boundingSphere = _geometry.boundingSphere;
    }
};

// as low as 32 (for spaces)
// charCode - usually between 65 and 122
// other unicode languages could go up to 10k
var GEN_DIVISOR = 2147483648 - 1; // 2^31 - 1
var randomBranch = function randomBranch(idx, substring, numBranches, numWraps) {
    var gen = stringHash(substring);
    function next() {
        gen = (gen * 4194303 + 127) % GEN_DIVISOR;
        return gen;
    }
    for (var i = 0; i < 5 + idx * numWraps; i += 1) {
        next();
    }
    var newVariation = function newVariation() {
        next();
        return objectValueByIndex(_transforms.VARIATIONS, gen);
    };
    var random = function random() {
        next();
        return gen / GEN_DIVISOR;
    };
    var affineBase = objectValueByIndex(_transforms.AFFINES, gen);
    var affine = function affine(point) {
        affineBase(point);
        // point.x += cX / 5;
        // point.y += cY / 5;
    };
    var variation = newVariation();

    if (random() < numWraps * 0.25) {
        variation = (0, _transforms.createInterpolatedVariation)(variation, newVariation(), function () {
            return 0.5;
        });
    } else if (numWraps > 2 && random() < 0.2) {
        variation = (0, _transforms.createRouterVariation)(variation, newVariation(), function (p) {
            return p.z < 0;
        });
    }
    var colorValues = [random() * 0.1 - 0.05, random() * 0.1 - 0.05, random() * 0.1 - 0.05];
    var focusIndex = idx % 3;
    colorValues[focusIndex] += 0.2;
    var color = new THREE.Color().fromArray(colorValues);
    color.multiplyScalar(numBranches / 3.5);
    var branch = {
        affine: affine,
        color: color,
        variation: variation
    };
    return branch;
};

var randomBranches = function randomBranches(name) {
    var numWraps = Math.floor(name.length / 5);
    var numBranches = Math.ceil(1 + name.length % 5 + numWraps);
    var branches = [];
    for (var i = 0; i < numBranches; i += 1) {
        var stringStart = (0, _math.map)(i, 0, numBranches, 0, name.length);
        var stringEnd = (0, _math.map)(i + 1, 0, numBranches, 0, name.length);
        var substring = name.substring(stringStart, stringEnd);
        branches.push(randomBranch(i, substring, numBranches, numWraps));
    }
    return branches;
};

var getPixel = function getPixel(vertex, width, height) {
    return {
        x: width * (vertex.x * 0.3 + 0.5),
        y: height * (vertex.y * 0.3 + 0.5)
    };
};

var normalize = function normalize(min, max, value) {
    return (value - min) / (max - min);
};

var drawStroke = function drawStroke(context, image, x, y, z) {
    var scaling = z;
    var width = 20 * scaling;
    var height = 20 * scaling;
    var angle = Math.random() * Math.PI;

    context.translate(x, y);
    context.rotate(angle);
    context.scale(scaling, scaling);
    context.drawImage(image, -width / 2, -height / 2, width, height);
    context.scale(1 / scaling, 1 / scaling);
    context.rotate(-angle);
    context.translate(-x, -y);
};

var generate = exports.generate = function generate() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        seed = _ref.seed,
        canvas = _ref.canvas,
        image = _ref.image,
        _ref$time = _ref.time,
        time = _ref$time === undefined ? 1 : _ref$time;

    globalBranches = randomBranches(seed);

    geometry = new THREE.Geometry();
    geometry.vertices = [];
    geometry.colors = [];
    superPoint = (0, _superPoint.createSuperPoint)(new THREE.Vector3(0, 0, 0), new THREE.Color(0, 0, 0), geometry, globalBranches);

    animate();

    // const canvas = new Canvas(800, 600);
    var ctx = canvas.getContext('2d');
    var _ref2 = [canvas.width, canvas.height],
        width = _ref2[0],
        height = _ref2[1];


    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';

    var bounds = {
        xMax: _minSafeInteger2.default,
        xMin: _maxSafeInteger2.default,
        yMax: _minSafeInteger2.default,
        yMin: _maxSafeInteger2.default,
        zMax: _minSafeInteger2.default,
        zMin: _maxSafeInteger2.default
    };

    for (var i = 0; i < geometry.vertices.length; i += 1) {
        if (geometry.vertices[i].x < bounds.xMin) {
            bounds.xMin = geometry.vertices[i].x;
        }
        if (geometry.vertices[i].x > bounds.xMax) {
            bounds.xMax = geometry.vertices[i].x;
        }
        if (geometry.vertices[i].y < bounds.yMin) {
            bounds.yMin = geometry.vertices[i].y;
        }
        if (geometry.vertices[i].y > bounds.yMax) {
            bounds.yMax = geometry.vertices[i].y;
        }
        if (geometry.vertices[i].z < bounds.zMin) {
            bounds.zMin = geometry.vertices[i].z;
        }
        if (geometry.vertices[i].z > bounds.zMax) {
            bounds.zMax = geometry.vertices[i].z;
        }
    }

    for (var _i = 0; _i < geometry.vertices.length; _i += 1) {
        var coords = geometry.vertices[_i].applyAxisAngle(new THREE.Vector3(0, 1, 0), time * Math.PI * 2);
        // coords.x = normalize(bounds.xMin, bounds.xMax, coords.x);
        // coords.y = normalize(bounds.yMin, bounds.yMax, coords.y);
        // coords.z = normalize(bounds.zMin, bounds.zMax, coords.z);
        var pixel = getPixel(coords, width, height);
        ctx.beginPath();
        var maxWhite = 100;

        var style = 'rgba(' + Math.round(geometry.colors[_i].r * maxWhite) + ',' + Math.round(geometry.colors[_i].g * maxWhite) + ',' + Math.round(geometry.colors[_i].b * maxWhite) + ',0.6)';
        ctx.fillStyle = style;

        if (image === undefined) {
            var size = 2 * (1 - normalize(bounds.zMin, bounds.zMax, coords.z));
            ctx.arc(pixel.x, pixel.y, size, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
        } else {
            drawStroke(ctx, image, pixel.x, pixel.y, normalize(bounds.zMin, bounds.zMax, coords.z));
        }
    }

    return canvas.toDataURL();
};