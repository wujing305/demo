<template>
  <div>Instancing2</div>
</template>

<script lang="ts">
import * as THREE from "three";
import { BufferGeometryUtils } from "./BufferGeometryUtils";
import { OrbitControls } from "./OrbitControls";

let renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  material: THREE.Material;
let count = 1000;

export default {
  data() {
    return {};
  },
  mounted() {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xaaaaaa);
    document.body.appendChild(renderer.domElement);
    renderer.domElement.style.zIndex = "1";
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0px";
    renderer.domElement.style.left = "0px";
    scene = new THREE.Scene();

    scene.clear();

    const helper = new THREE.GridHelper(100, 100);
    scene.add(helper);

    camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );
    camera.position.z = 15;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener("change", render); // use if there is no animation loop
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.enableRotate = true;

    scene.add(new THREE.AmbientLight(0xffffff, 0.2));

    const light = new THREE.PointLight(0xffffff, 0.7);
    camera.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.x = 0;
    directionalLight.position.y = 0;
    directionalLight.position.z = 10;
    scene.add(directionalLight);
    scene.add(directionalLight.target);

    scene.add(camera);

    initMesh();

    render();
  },
};

function render() {
  renderer.render(scene, camera);
}

function initMesh() {
  clean();

  // make instances
  new THREE.BufferGeometryLoader()
    .setPath("models/json/")
    .load("sofa.json", function (geometry) {
      material = new THREE.MeshNormalMaterial();

      geometry.computeVertexNormals();

      //makeInstanced(geometry);
      //makeMerged(geometry);
      makeNaive(geometry);
    });
}

const randomizeMatrix = (function () {
  const position = new THREE.Vector3();
  const rotation = new THREE.Euler();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();

  return function (matrix) {
    position.x = Math.random() * 40 - 20;
    position.y = Math.random() * 40 - 20;
    position.z = Math.random() * 40 - 20;

    rotation.x = Math.random() * 2 * Math.PI;
    rotation.y = Math.random() * 2 * Math.PI;
    rotation.z = Math.random() * 2 * Math.PI;

    quaternion.setFromEuler(rotation);

    scale.x = scale.y = scale.z = Math.random() * 1;

    matrix.compose(position, quaternion, scale);
  };
})();

function clean() {
  const meshes = [];

  scene.traverse(function (object) {
   // if (object.isMesh) meshes.push(object);
  });

  for (let i = 0; i < meshes.length; i++) {
    const mesh = meshes[i];
    mesh.material.dispose();
    mesh.geometry.dispose();

    scene.remove(mesh);
  }
}

function makeInstanced(geometry) {
  const matrix = new THREE.Matrix4();
  const mesh = new THREE.InstancedMesh(geometry, material, count);

  for (let i = 0; i < count; i++) {
    randomizeMatrix(matrix);
    mesh.setMatrixAt(i, matrix);
  }

  scene.add(mesh);

  const geometryByteLength = getGeometryByteLength(geometry);

  render();
}

function getGeometryByteLength(geometry) {
  let total = 0;

  if (geometry.index) total += geometry.index.array.byteLength;

  for (const name in geometry.attributes) {
    total += geometry.attributes[name].array.byteLength;
  }

  return total;
}

function makeMerged(geometry) {
  const geometries = [];
  const matrix = new THREE.Matrix4();

  for (let i = 0; i < count; i++) {
    randomizeMatrix(matrix);

    const instanceGeometry = geometry.clone();
    instanceGeometry.applyMatrix4(matrix);

    geometries.push(instanceGeometry);
  }

  const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries);

  scene.add(new THREE.Mesh(mergedGeometry, material));

  render();

}

function makeNaive(geometry) {
  const matrix = new THREE.Matrix4();

  for (let i = 0; i < count; i++) {
    randomizeMatrix(matrix);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.applyMatrix4(matrix);

    scene.add(mesh);
  }

  render();

  const geometryByteLength = getGeometryByteLength(geometry);
}
</script>