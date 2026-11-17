import * as THREE from 'three';

export const palette = { wall: '#f4f2e9', trim: '#d6d5c9', wood: '#bd9169', darkWood: '#93734f', linen: '#e7e0ce', sage: '#8c9e80', dark: '#34493d', stone: '#e2dfd4', metal: '#959e99', white: '#faf9f3' };
const materials = new Map();
export function material(color, options = {}) {
  const key = color + JSON.stringify(options);
  if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: .78, ...options }));
  return materials.get(key);
}
export function box(parent, w, h, d, x, y, z, color = palette.white, options = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material(color, options));
  mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
export function cylinder(parent, radius, height, x, y, z, color, topRadius = radius) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(topRadius, radius, height, 24), material(color));
  mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
export function ellipsoid(parent, rx, ry, rz, x, y, z, color) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), material(color)); mesh.scale.set(rx, ry, rz); mesh.position.set(x, y, z); mesh.castShadow = true; parent.add(mesh); return mesh;
}
export function group(parent, x = 0, z = 0, rotation = 0) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rotation; parent.add(g); return g; }
export function plant(parent, x, z, size = 1, base = 0) {
  cylinder(parent, .14 * size, .26 * size, x, base + .13 * size, z, '#b8a48b', .18 * size);
  for (let i = 0; i < 6; i++) { const angle = i * Math.PI / 3; const leaf = ellipsoid(parent, .09 * size, .28 * size, .055 * size, x + Math.cos(angle) * .09 * size, base + .4 * size, z + Math.sin(angle) * .09 * size, i % 2 ? '#70865f' : '#91a17b'); leaf.rotation.z = Math.cos(angle) * .6; leaf.rotation.x = Math.sin(angle) * .6; }
}
