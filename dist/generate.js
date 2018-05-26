'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.generate = undefined;

var _three = require('three');

var THREE = _interopRequireWildcard(_three);

var _math = require('./math');

var _transforms = require('./common/flame/transforms');

var _branch = require('./common/flame/branch');

var _superPoint = require('./common/flame/superPoint');

var _updateVisitor = require('./common/flame/updateVisitor');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var geometry = void 0;
var globalBranches = void 0;
var superPoint = void 0;
var cX = 0;
var cY = 0;
var jumpiness = 3;
var boundingSphere = void 0;
var noiseGainScale = 0;
var oscLowGate = 0;
var oscHighGate = 0;

var noiseGain = void 0;
var oscLow = void 0;
var oscHigh = void 0;
var oscHighGain = void 0;
var oscGain = void 0;
var chord = void 0;
var filter = void 0;
var compressor = void 0;

var objectValueByIndex = function objectValueByIndex(obj, index) {
    var keys = Object.keys(obj);
    return obj[keys[index % keys.length]];
};

var sigmoid = function sigmoid(x) {
    if (x > 10) {
        return 1;
    } else if (x < -10) {
        return 0;
    }
    return 1 / (1 + Math.exp(-x));
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

function computeDepth() {
    // points at exactly depth d = b^d
    // points from depth 0...d = b^0 + b^1 + b^2 + ... b^d
    // we want total points to be ~120k, so
    // 120k = b^0 + b^1 + ... + b^d
    // only the last level really matters - the last level accounts for at least
    // half of the total sum (except for b = 1)
    var depth = globalBranches.length === 1 ? 1000 : Math.floor(Math.log(100000) / Math.log(globalBranches.length));
    // just do depth 1k to prevent call stack
    return depth;
}

var animate = function animate(time) {
    cX = 2 * sigmoid(6 * Math.sin(time)) - 1;
    var velocityVisitor = (0, _updateVisitor.createVelocityTrackerVisitor)();
    var varianceVisitor = (0, _updateVisitor.createLengthVarianceTrackerVisitor)();
    var countVisitor = (0, _updateVisitor.createBoxCountVisitor)([1, 0.1, 0.01, 0.001]);
    superPoint.recalculate(jumpiness, jumpiness, jumpiness, computeDepth(), velocityVisitor, varianceVisitor, countVisitor);
    if (boundingSphere == null) {
        geometry.computeBoundingSphere();
        boundingSphere = geometry.boundingSphere;
    }

    /* const velocity = velocityVisitor.computeVelocity();
    const variance = varianceVisitor.computeVariance();
    const [count, countDensity] = countVisitor.computeCountAndCountDensity();
     // density ranges from 1 to ~6 or 7 at the high end.
    // low density 1.5 and below are spaced out, larger fractals
    // between 1.5 and 3 is a nice variety
    // anything above 3 is really dense, hard to see
    const density = countDensity / count;
     const velocityFactor = Math.min(velocity * noiseGainScale, 0.3);
    if (audioHasNoise) {
        const noiseAmplitude = 2 / (1 + (density * density));
        // smooth out density random noise
        const target = noiseGain.gain.value * 0.9 + 0.1 * (velocityFactor * noiseAmplitude + 1e-4);
        noiseGain.gain.setTargetAtTime(target, noiseGain.context.currentTime, 0.016);
    }
     const newOscGain = oscGain.gain.value * 0.9 + 0.1 * Math.max(0, Math.min(velocity * velocity * 2000, 0.6) - 0.01);
    oscGain.gain.setTargetAtTime(newOscGain, oscGain.context.currentTime, 0.016);
     const newOscFreq = oscLow.frequency.value * 0.8 + 0.2 * (100 + baseLowFrequency * Math.pow(2, Math.log(1 + variance)));
    oscLow.frequency.setTargetAtTime(newOscFreq * oscLowGate, oscLow.context.currentTime, 0.016);
     const velocitySq = map(velocity * velocity, 1e-8, 0.005, -10, 10);
    oscHigh.frequency.setTargetAtTime(
        Math.min(map(sigmoid(velocitySq), 0, 1, baseFrequency, baseFrequency * 5), 20000) * oscHighGate,
        oscHigh.context.currentTime,
        0.016,
    );
     if (audioHasChord) {
        chord.setFrequency(100 + 100 * boundingSphere.radius);
        chord.setMinorBias(baseThirdBias + velocity * 100 + sigmoid(variance - 3) * 4);
        chord.setFifthBias(baseFifthBias + countDensity / 3);
        const target = (chord.gain.gain.value * 0.9 + 0.1 * (velocityFactor * count * count / 8) + 3e-5);
        chord.gain.gain.setTargetAtTime(target, chord.gain.context.currentTime, 0.016);
    }
     const cameraLength = camera.position.length();
    compressor.ratio.setTargetAtTime(1 + 3 / cameraLength, this.audioContext.currentTime, 0.016);
    this.audioContext.gain.gain.setTargetAtTime((2.5 / cameraLength) + 0.05, this.audioContext.currentTime, 0.016);
     console.log(geometry); */
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

    var hash = stringHash(seed);
    var hashNorm = hash % 1024 / 1024;

    cY = (0, _math.map)(hashNorm, 0, 1, -2.5, 2.5);
    globalBranches = randomBranches(seed);

    geometry = new THREE.Geometry();
    geometry.vertices = [];
    geometry.colors = [];
    superPoint = (0, _superPoint.createSuperPoint)(new THREE.Vector3(0, 0, 0), new THREE.Color(0, 0, 0), geometry, globalBranches);

    animate(Math.PI / 5);

    // const canvas = new Canvas(800, 600);
    var ctx = canvas.getContext('2d');
    var width = void 0,
        height = void 0;
    var _ref2 = [canvas.width, canvas.height];
    width = _ref2[0];
    height = _ref2[1];


    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.fillStyle = 'white';
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';

    var bounds = {
        xMax: Number.MIN_SAFE_INTEGER,
        xMin: Number.MAX_SAFE_INTEGER,
        yMax: Number.MIN_SAFE_INTEGER,
        yMin: Number.MAX_SAFE_INTEGER,
        zMax: Number.MIN_SAFE_INTEGER,
        zMin: Number.MAX_SAFE_INTEGER
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
        var coords = geometry.vertices[_i].applyAxisAngle(new THREE.Vector3(0, 1, 0), time * Math.PI);
        // coords.x = normalize(bounds.xMin, bounds.xMax, coords.x);
        // coords.y = normalize(bounds.yMin, bounds.yMax, coords.y);
        // coords.z = normalize(bounds.zMin, bounds.zMax, coords.z);
        var pixel = getPixel(coords, width, height);
        ctx.beginPath();
        var maxWhite = 100;

        var style = 'rgba(' + Math.round(geometry.colors[_i].r * maxWhite) + ',' + Math.round(geometry.colors[_i].g * maxWhite) + ',' + Math.round(geometry.colors[_i].b * maxWhite) + ', 0.6)';
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