<template>
  <div>Instancing1</div>
</template>

<script lang="ts">
import * as THREE from "three";
import { OrbitControls } from "./OrbitControls";

let renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera;
let mesh;
const amount = parseInt(window.location.search.substr(1)) || 10;
const count = Math.pow(amount, 3);
const dummy = new THREE.Object3D();

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

    const loader = new THREE.BufferGeometryLoader();
//    loader.load("models/json/suzanne_buffergeometry.json", function (geometry) {
    loader.load("models/json/sofa.json", function (geometry) {
      geometry.computeVertexNormals();
      geometry.scale(0.5, 0.5, 0.5);

      const material = new THREE.MeshNormalMaterial();
      // check overdraw
      // let material = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.1, transparent: true } );

      mesh = new THREE.InstancedMesh(geometry, material, count);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
      scene.add(mesh);

      render();

      // const gui = new GUI();
      // gui.add(mesh, "count", 0, count);
    });

    render();
  },
};

function render() {
  if (mesh) {
//    const time = Date.now() * 0.001;
    const time = 0;

    mesh.rotation.x = Math.sin(time / 4);
    mesh.rotation.y = Math.sin(time / 2);

    let i = 0;
    const offset = (amount - 1) / 2;

    for (let x = 0; x < amount; x++) {
      for (let y = 0; y < amount; y++) {
        for (let z = 0; z < amount; z++) {
          dummy.position.set(offset - x, offset - y, offset - z);
          dummy.rotation.y =
            Math.sin(x / 4 + time) +
            Math.sin(y / 4 + time) +
            Math.sin(z / 4 + time);
          dummy.rotation.z = dummy.rotation.y * 2;

          dummy.updateMatrix();

          mesh.setMatrixAt(i++, dummy.matrix);
        }
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
  }

  renderer.render(scene, camera);
}
</script>