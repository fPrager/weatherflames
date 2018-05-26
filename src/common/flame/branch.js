// import { Transform } from './transforms';

/*
export interface Branch {
    color,
    affine,
    variation
}
*/

export const applyBranch = (branch, point, color) => {
    // apply the affine transform to the point
    branch.affine(point);

    // apply the nonlinear variation to the point
    branch.variation(point);

    // interpolate towards the affine color
    // color.lerp(affine.color, 0.5);
    color.add(branch.color);
};
