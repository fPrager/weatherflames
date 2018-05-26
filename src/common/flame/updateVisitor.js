import * as THREE from 'three';

export const createVelocityTrackerVisitor = () => {
    let velocity = 0;
    let numVisited = 0;

    return {
        velocity,
        numVisited,
        visit(p) {
            velocity += p.lastPoint.distanceTo(p.point);
            numVisited += 1;
        },
        computeVelocity() {
            if (numVisited === 0) {
                return 0;
            }
            return velocity / numVisited;
        },
    };
};

export const createLengthVarianceTrackerVisitor = () => {
    return {
        varianceNumSamples: 0,
        varianceSum: 0,
        varianceSumSq: 0,
        variance: 0,
        visit(p) {
            const lengthSq = p.point.lengthSq();
            this.varianceNumSamples += 1;
            this.varianceSum += Math.sqrt(lengthSq);
            this.varianceSumSq += lengthSq;
        },
        computeVariance() {
            const { varianceSumSq, varianceSum, varianceNumSamples } = this;
            if (this.varianceNumSamples === 0) {
                return 0;
            }
            // can go as high as 15 - 20, as low as 0.1
            return (varianceSumSq -
                ((varianceSum * varianceSum) / varianceNumSamples)) / (varianceNumSamples - 1);
        },
    };
};

export const createBoxCountVisitor = (sideLengths) => {
    let boxHashes;
    let counts;
    let densities;

    const constructor = () => {
        boxHashes = sideLengths.map(() => ({}));
        counts = sideLengths.map(() => 0);
        densities = sideLengths.map(() => 0);
    };
    constructor();

    const temp = new THREE.Vector3();

    const linearRegressionSlope = (xs, ys) => {
        const xAvg = xs.reduce((sum, x) => sum + x, 0);
        const yAvg = ys.reduce((sum, y) => sum + y, 0);
        const denominator = xs.reduce((sum, x) => (x - xAvg) * (x - xAvg), 0);
        const numerator = xs.reduce((sum, x, idx) => (x - xAvg) * (ys[idx] - yAvg), 0);
        return numerator / denominator;
    };

    return {
        visit(p) {
            for (let idx = 0, sll = sideLengths.length; idx < sll; idx += 1) {
                const sideLength = sideLengths[idx];
                const boxHash = boxHashes[idx];
                // round to nearest sideLength interval on x/y/z
                // e.g. for side length 2
                // [0 to 2) -> 0
                // [2 to 4) -> 2
                temp.copy(p.point).divideScalar(sideLength).floor().multiplyScalar(sideLength);
                const hash = `${temp.x},${temp.y},${temp.z}`;
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
                    densities[idx] += (2 * boxHash[hash]) + 1;
                    boxHash[hash] += 1;
                }
            }
        },
        computeCountAndCountDensity() {
            // so we have three data points:
            // { volume: 1, count: 11 },
            // { volume: 1e-3, count: 341 }, { volume: 1e-6, count: 15154 }
            // the formula is roughly count = C * side^dimension
            // lets just log both of them
            // log(count) = dimesion*log(C*side);
            // linear regression out the C*side to get the dimension
            const logSideLengths = sideLengths.map(sideLength => Math.log(sideLength));
            const logCounts = counts.map(count => Math.log(count));
            const logDensities = densities.map(density => Math.log(density));

            const slopeCount = -linearRegressionSlope(logSideLengths, logCounts);
            const slopeDensity = -linearRegressionSlope(logSideLengths, logDensities);

            // count ranges from 0.5 in the extremely shunken case (aaaaa)
            // to 2.8 in a really spaced out case
            // much of it is ~2; anything < 1.7 is very linear/1D

            // countDensity ranges from 3.5 (adsfadsfa)
            // really spaced out to ~6 which is extremely tiny
            // much of it ranges from 3.5 to like 4.5
            // it's a decent measure of how "dense" the fractal is
            return [slopeCount, slopeDensity];
        },
    };
};

