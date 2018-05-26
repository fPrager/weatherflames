'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createBoxCountVisitor = exports.createLengthVarianceTrackerVisitor = exports.createVelocityTrackerVisitor = undefined;

var _three = require('three');

var THREE = _interopRequireWildcard(_three);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var createVelocityTrackerVisitor = exports.createVelocityTrackerVisitor = function createVelocityTrackerVisitor() {
    var velocity = 0;
    var numVisited = 0;

    return {
        velocity: velocity,
        numVisited: numVisited,
        visit: function visit(p) {
            velocity += p.lastPoint.distanceTo(p.point);
            numVisited += 1;
        },
        computeVelocity: function computeVelocity() {
            if (numVisited === 0) {
                return 0;
            }
            return velocity / numVisited;
        }
    };
};

var createLengthVarianceTrackerVisitor = exports.createLengthVarianceTrackerVisitor = function createLengthVarianceTrackerVisitor() {
    return {
        varianceNumSamples: 0,
        varianceSum: 0,
        varianceSumSq: 0,
        variance: 0,
        visit: function visit(p) {
            var lengthSq = p.point.lengthSq();
            this.varianceNumSamples += 1;
            this.varianceSum += Math.sqrt(lengthSq);
            this.varianceSumSq += lengthSq;
        },
        computeVariance: function computeVariance() {
            var varianceSumSq = this.varianceSumSq,
                varianceSum = this.varianceSum,
                varianceNumSamples = this.varianceNumSamples;

            if (this.varianceNumSamples === 0) {
                return 0;
            }
            // can go as high as 15 - 20, as low as 0.1
            return (varianceSumSq - varianceSum * varianceSum / varianceNumSamples) / (varianceNumSamples - 1);
        }
    };
};

var createBoxCountVisitor = exports.createBoxCountVisitor = function createBoxCountVisitor(sideLengths) {
    var boxHashes = void 0;
    var counts = void 0;
    var densities = void 0;

    var constructor = function constructor() {
        boxHashes = sideLengths.map(function () {
            return {};
        });
        counts = sideLengths.map(function () {
            return 0;
        });
        densities = sideLengths.map(function () {
            return 0;
        });
    };
    constructor();

    var temp = new THREE.Vector3();

    var linearRegressionSlope = function linearRegressionSlope(xs, ys) {
        var xAvg = xs.reduce(function (sum, x) {
            return sum + x;
        }, 0);
        var yAvg = ys.reduce(function (sum, y) {
            return sum + y;
        }, 0);
        var denominator = xs.reduce(function (sum, x) {
            return (x - xAvg) * (x - xAvg);
        }, 0);
        var numerator = xs.reduce(function (sum, x, idx) {
            return (x - xAvg) * (ys[idx] - yAvg);
        }, 0);
        return numerator / denominator;
    };

    return {
        visit: function visit(p) {
            for (var idx = 0, sll = sideLengths.length; idx < sll; idx += 1) {
                var sideLength = sideLengths[idx];
                var boxHash = boxHashes[idx];
                // round to nearest sideLength interval on x/y/z
                // e.g. for side length 2
                // [0 to 2) -> 0
                // [2 to 4) -> 2
                temp.copy(p.point).divideScalar(sideLength).floor().multiplyScalar(sideLength);
                var hash = temp.x + ',' + temp.y + ',' + temp.z;
                if (!boxHash[hash]) {
                    boxHash[hash] = 1;
                    counts[idx] += 1;
                    densities[idx] += 1;
                } else {
                    // approximates boxHash^2
                    // we have the sequence 1, 2, 3, 4, 5, ...n
                    // assume we've gotten n^2 contribution.
                    // now we want to get to (n+1)^2 contribution. What do we add?
                    // (n+1)^2 - n^2 = (n+1)*(n+1) - n^2 = n^2 + 2n + 1 - n^2 = 2n + 1
                    densities[idx] += 2 * boxHash[hash] + 1;
                    boxHash[hash] += 1;
                }
            }
        },
        computeCountAndCountDensity: function computeCountAndCountDensity() {
            // so we have three data points:
            // { volume: 1, count: 11 },
            // { volume: 1e-3, count: 341 }, { volume: 1e-6, count: 15154 }
            // the formula is roughly count = C * side^dimension
            // lets just log both of them
            // log(count) = dimesion*log(C*side);
            // linear regression out the C*side to get the dimension
            var logSideLengths = sideLengths.map(function (sideLength) {
                return Math.log(sideLength);
            });
            var logCounts = counts.map(function (count) {
                return Math.log(count);
            });
            var logDensities = densities.map(function (density) {
                return Math.log(density);
            });

            var slopeCount = -linearRegressionSlope(logSideLengths, logCounts);
            var slopeDensity = -linearRegressionSlope(logSideLengths, logDensities);

            // count ranges from 0.5 in the extremely shunken case (aaaaa)
            // to 2.8 in a really spaced out case
            // much of it is ~2; anything < 1.7 is very linear/1D

            // countDensity ranges from 3.5 (adsfadsfa)
            // really spaced out to ~6 which is extremely tiny
            // much of it ranges from 3.5 to like 4.5
            // it's a decent measure of how "dense" the fractal is
            return [slopeCount, slopeDensity];
        }
    };
};