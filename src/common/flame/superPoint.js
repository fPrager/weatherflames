import * as THREE from 'three';

import { applyBranch } from './branch';
import { VARIATIONS } from './transforms';
// import { UpdateVisitor } from './updateVisitor';

let globalSubtreeIterationIndex = 0;

export const createSuperPoint = (point, color, rootGeometry, branches) => {
    let children;
    const lastPoint = new THREE.Vector3();

    const constructor = () => {
        lastPoint.copy(point);
        rootGeometry.vertices.push(point);
        rootGeometry.colors.push(color);
    };

    constructor();

    return {
        point,
        color,
        children,
        lastPoint,
        rootGeometry,
        updateSubtree(depth, ...visitors) {
            if (depth === 0) { return; }

            if (children === undefined) {
                children = branches.map(() => {
                    return createSuperPoint(
                        new THREE.Vector3(),
                        new THREE.Color(0, 0, 0),
                        this.rootGeometry,
                        branches,
                    );
                });
            }

            for (let idx = 0, l = children.length; idx < l; idx += 1) {
                globalSubtreeIterationIndex += 1;
                const child = children[idx];
                const branch = branches[idx];

                // reset the child's position to your updated position so it's ready to get stepped
                child.lastPoint.copy(child.point);
                child.point.copy(point);
                child.color.copy(color);

                applyBranch(branch, child.point, child.color);

                // take far away points and move them into the center
                // again to keep points from getting too out of hand
                if (child.point.lengthSq() > 50 * 50) {
                    VARIATIONS.Spherical(child.point);
                }

                if (globalSubtreeIterationIndex % 307 === 0) {
                    for (let i = 0; i < visitors.length; i += 1) {
                        visitors[i].visit(child);
                    }
                }

                child.updateSubtree(depth - 1, ...visitors);
            }
        },
        recalculate(initialX, initialY, initialZ, depth, ...visitors) {
            globalSubtreeIterationIndex = 0;
            this.point.set(initialX, initialY, initialZ);
            // console.time("updateSubtree");
            this.updateSubtree(depth, ...visitors);
            // console.timeEnd("updateSubtree");
            this.rootGeometry.verticesNeedUpdate = true;
        },
    };
};
