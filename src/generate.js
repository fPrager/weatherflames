import * as THREE from 'three';
import { map } from './math';
import {
    AFFINES,
    VARIATIONS,
    createInterpolatedVariation,
    createRouterVariation,
} from './common/flame/transforms';
import { createSuperPoint } from './common/flame/superPoint';
import {
    createVelocityTrackerVisitor,
    createLengthVarianceTrackerVisitor,
    createBoxCountVisitor,
} from './common/flame/updateVisitor';

let geometry;
let globalBranches;
let superPoint;
const jumpiness = 3;
let boundingSphere;

const objectValueByIndex = (obj, index) => {
    const keys = Object.keys(obj);
    return obj[keys[index % keys.length]];
};

const stringHash = (s) => {
    let hash = 0;
    let char;
    if (s.length === 0) { return hash; }
    for (let i = 0, l = s.length; i < l; i += 1) {
        char = s.charCodeAt(i);
        hash = (hash * 31) + char;
        // hash |= 0; // Convert to 32bit integer
    }
    hash *= hash * 31;
    return hash;
};


const computeDepth = () => {
    // points at exactly depth d = b^d
    // points from depth 0...d = b^0 + b^1 + b^2 + ... b^d
    // we want total points to be ~120k, so
    // 120k = b^0 + b^1 + ... + b^d
    // only the last level really matters - the last level accounts for at least
    // half of the total sum (except for b = 1)
    const depth = (globalBranches.length === 1)
        ? 1000
        : Math.floor(Math.log(100000) / Math.log(globalBranches.length));
        // just do depth 1k to prevent call stack
    return depth;
};

const animate = () => {
    const velocityVisitor = createVelocityTrackerVisitor();
    const varianceVisitor = createLengthVarianceTrackerVisitor();
    const countVisitor = createBoxCountVisitor([1, 0.1, 0.01, 0.001]);
    superPoint.recalculate(
        jumpiness,
        jumpiness,
        jumpiness,
        computeDepth(),
        velocityVisitor,
        varianceVisitor,
        countVisitor,
    );
    if (boundingSphere == null) {
        geometry.computeBoundingSphere();
        ({ boundingSphere } = geometry);
    }
};

// as low as 32 (for spaces)
// charCode - usually between 65 and 122
// other unicode languages could go up to 10k
const GEN_DIVISOR = 2147483648 - 1; // 2^31 - 1
const randomBranch = (idx, substring, numBranches, numWraps) => {
    let gen = stringHash(substring);
    function next() {
        gen = ((gen * 4194303) + 127) % GEN_DIVISOR;
        return gen;
    }
    for (let i = 0; i < 5 + (idx * numWraps); i += 1) {
        next();
    }
    const newVariation = () => {
        next();
        return objectValueByIndex(VARIATIONS, gen);
    };
    const random = () => {
        next();
        return gen / GEN_DIVISOR;
    };
    const affineBase = objectValueByIndex(AFFINES, gen);
    const affine = (point) => {
        affineBase(point);
        // point.x += cX / 5;
        // point.y += cY / 5;
    };
    let variation = newVariation();

    if (random() < numWraps * 0.25) {
        variation = createInterpolatedVariation(
            variation,
            newVariation(),
            () => 0.5,
        );
    } else if (numWraps > 2 && random() < 0.2) {
        variation = createRouterVariation(
            variation,
            newVariation(),
            p => p.z < 0,
        );
    }
    const colorValues = [
        (random() * 0.1) - 0.05,
        (random() * 0.1) - 0.05,
        (random() * 0.1) - 0.05,
    ];
    const focusIndex = idx % 3;
    colorValues[focusIndex] += 0.2;
    const color = new THREE.Color().fromArray(colorValues);
    color.multiplyScalar(numBranches / 3.5);
    const branch = {
        affine,
        color,
        variation,
    };
    return branch;
};

const randomBranches = (name) => {
    const numWraps = Math.floor(name.length / 5);
    const numBranches = Math.ceil(1 + (name.length % 5) + numWraps);
    const branches = [];
    for (let i = 0; i < numBranches; i += 1) {
        const stringStart = map(i, 0, numBranches, 0, name.length);
        const stringEnd = map(i + 1, 0, numBranches, 0, name.length);
        const substring = name.substring(stringStart, stringEnd);
        branches.push(randomBranch(i, substring, numBranches, numWraps));
    }
    return branches;
};

const getPixel = (vertex, width, height) => {
    return {
        x: width * ((vertex.x * 0.3) + 0.5),
        y: height * ((vertex.y * 0.3) + 0.5),
    };
};

const normalize = (min, max, value) => {
    return (value - min) / (max - min);
};

const drawStroke = (context, image, x, y, z) => {
    const scaling = z;
    const width = 20 * scaling;
    const height = 20 * scaling;
    const angle = Math.random() * Math.PI;

    context.translate(x, y);
    context.rotate(angle);
    context.scale(scaling, scaling);
    context.drawImage(image, -width / 2, -height / 2, width, height);
    context.scale(1 / scaling, 1 / scaling);
    context.rotate(-angle);
    context.translate(-x, -y);
};

export const generate = ({
    seed, canvas, image, time = 1,
} = { }) => {
    globalBranches = randomBranches(seed);

    geometry = new THREE.Geometry();
    geometry.vertices = [];
    geometry.colors = [];
    superPoint = createSuperPoint(
        new THREE.Vector3(0, 0, 0),
        new THREE.Color(0, 0, 0),
        geometry,
        globalBranches,
    );

    animate();

    // const canvas = new Canvas(800, 600);
    const ctx = canvas.getContext('2d');
    const [width, height] = [canvas.width, canvas.height];


    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';

    const bounds = {
        xMax: Number.MIN_SAFE_INTEGER,
        xMin: Number.MAX_SAFE_INTEGER,
        yMax: Number.MIN_SAFE_INTEGER,
        yMin: Number.MAX_SAFE_INTEGER,
        zMax: Number.MIN_SAFE_INTEGER,
        zMin: Number.MAX_SAFE_INTEGER,
    };

    for (let i = 0; i < geometry.vertices.length; i += 1) {
        if (geometry.vertices[i].x < bounds.xMin) { bounds.xMin = geometry.vertices[i].x; }
        if (geometry.vertices[i].x > bounds.xMax) { bounds.xMax = geometry.vertices[i].x; }
        if (geometry.vertices[i].y < bounds.yMin) { bounds.yMin = geometry.vertices[i].y; }
        if (geometry.vertices[i].y > bounds.yMax) {
            bounds.yMax = geometry.vertices[i].y;
        }
        if (geometry.vertices[i].z < bounds.zMin) { bounds.zMin = geometry.vertices[i].z; }
        if (geometry.vertices[i].z > bounds.zMax) {
            bounds.zMax = geometry.vertices[i].z;
        }
    }

    for (let i = 0; i < geometry.vertices.length; i += 1) {
        const coords = geometry.vertices[i].applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
            time * Math.PI * 2,
        );
        // coords.x = normalize(bounds.xMin, bounds.xMax, coords.x);
        // coords.y = normalize(bounds.yMin, bounds.yMax, coords.y);
        // coords.z = normalize(bounds.zMin, bounds.zMax, coords.z);
        const pixel = getPixel(coords, width, height);
        ctx.beginPath();
        const maxWhite = 100;

        const style = `rgba(${
            Math.round(geometry.colors[i].r * maxWhite)
        },${
            Math.round(geometry.colors[i].g * maxWhite)
        },${
            Math.round(geometry.colors[i].b * maxWhite)
        },0.6)`;
        ctx.fillStyle = style;

        if (image === undefined) {
            const size = 2 * (1 - normalize(bounds.zMin, bounds.zMax, coords.z));
            ctx.arc(pixel.x, pixel.y, size, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
        } else {
            drawStroke(ctx, image, pixel.x, pixel.y, normalize(bounds.zMin, bounds.zMax, coords.z));
        }
    }

    return canvas.toDataURL();
};

