// import * as THREE from 'three';

// export type Transform = (point: THREE.Vector3) => void;

export const AFFINES = {
    // lerp halfway towards the origin, biased by -1
    TowardsOriginNegativeBias: (point) => {
        point.set(((point.x - 1) / 2) + 0.25, (point.y - 1) / 2, point.z / 2);
    },
    // lerp towards the origin, biasing x by 1, y by -1
    TowardsOrigin2: (point) => {
        point.set((point.x + 1) / 2, ((point.y - 1) / 2) - 0.1, ((point.z + 1) / 2) - 0.1);
    },
    Swap: (point) => {
        point.set((point.y + point.z) / 2.5, (point.x + point.z) / 2.5, (point.x + point.y) / 2.5);
    },
    SwapSub: (point) => {
        point.set((point.y - point.z) / 2, (point.z - point.x) / 2, (point.x - point.y) / 2);
    },
    Negate: (point) => {
        point.set(-point.x, -point.y, -point.z);
    },
    NegateSwap: (point) => {
        point.set(
            (-point.x + point.y + point.z) / 2.1,
            (-point.y + point.x + point.z) / 2.1,
            (-point.z + point.x + point.y) / 2.1,
        );
    },
    Up1: (point) => {
        point.set(point.x, point.y, point.z + 1);
    },
};

export const VARIATIONS = {
    Linear: () => {
        // no op
    },
    Sin: (point) => {
        point.set(Math.sin(point.x), Math.sin(point.y), Math.sin(point.z));
    },
    Spherical: (point) => {
        const lengthSq = point.lengthSq();
        if (lengthSq !== 0) {
            point.multiplyScalar(1 / lengthSq);
        }
    },
    Polar: (point) => {
        point.set(
            Math.atan2(point.y, point.x) / Math.PI, point.length() - 1,
            Math.atan2(point.z, point.x),
        );
    },
    Swirl: (point) => {
        const r2 = point.lengthSq();
        point.set(
            (point.z * Math.sin(r2)) - (point.y * Math.cos(r2)),
            (point.x * Math.cos(r2)) + (point.z * Math.sin(r2)),
            (point.x * Math.sin(r2)) - (point.y * Math.sin(r2)),
        );
    },
    Normalize: (point) => {
        // point.setLength(Math.sqrt(point.length()));
        point.normalize();
    },
    Shrink: (point) => {
        point.setLength(Math.exp(-point.lengthSq()));
    },
};

export function createInterpolatedVariation(variationA, variationB, interpolationFn) {
    return (pointA) => {
        const pointB = pointA.clone();
        variationA(pointA);
        variationB(pointB);
        // if (Number.isNaN(pointA.lengthManhattan()) || Number.isNaN(pointB.lengthManhattan())) {
        //     debugger;
        // }
        const interpolatedAmount = interpolationFn();
        pointA.lerp(pointB, interpolatedAmount);
    };
}

export function createRouterVariation(vA, vB, router) {
    return (a) => {
        const choice = router(a);
        if (choice) {
            vA(a);
        } else {
            vB(a);
        }
    };
}
