import { box, ellipsoid, group } from '../utils.js';
export function criarVaso(parent,x,z,rotation=0) {
  const g=group(parent,x,z,rotation);box(g,.35,.64,.18,0,.35,-.18,'#f2f2e9');ellipsoid(g,.16,.22,.21,0,.24,.03,'#e9ece4');ellipsoid(g,.205,.08,.265,0,.43,.06,'#fafbf5');ellipsoid(g,.14,.012,.19,0,.505,.07,'#c3d1c7');box(g,.07,.012,.03,0,.68,-.18,'#a7b4a7');return g;
}
