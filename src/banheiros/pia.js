import { box, group, ellipsoid, cylinder } from '../utils.js';
export function criarPiaBanheiro(parent,x,z,rotation=0) {
  const g=group(parent,x,z,rotation);box(g,.45,.5,.37,0,.52,0,'#b9a282');box(g,.5,.04,.41,0,.8,0,'#eae9db');ellipsoid(g,.2,.07,.155,0,.85,0,'#fafbf5');ellipsoid(g,.14,.012,.1,0,.916,0,'#c6d3c9');cylinder(g,.015,.16,0,.91,-.16,'#929e92');box(g,.025,.025,.09,0,.985,-.12,'#929e92');box(g,.43,.61,.025,0,1.44,-.22,'#8eaa9f',{metalness:.6,roughness:.16});return g;
}
