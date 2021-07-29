<template>
  <div>TestScene</div>
</template>

<script lang="ts">
import * as THREE from "three";
import { OrbitControls } from './OrbitControls';
import {Matrix4} from "three"
import ModelLoader2 from './ModelLoader2'
import { Geometry } from './Geometry';

let renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera;

export default {
  data() {
    return{

    }
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

    const helper = new THREE.GridHelper( 100, 100 );
    scene.add(helper);

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.z = 15;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render); // use if there is no animation loop
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

    loadScene(49);

    render();
  },
};

function render() {

    renderer.render(scene, camera);

}

async function loadScene(id: number, updateModel = false) { //49
    const sceneQuery = {
        id: id,
        mode: 1,
    };
    const response = await fetch('api/v1/scene/querySceneData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(sceneQuery),
        mode: 'cors',
    });

    let r = await response.json();
    if (r.msg != 'ok') {
        alert("未取到数据");
        return;
    }

    console.log("r=", r);

    loadAndRender(r.data, "./");

    // console.log("window.location=", window.location);
    // // let ip = osHelper.getIPAdress();
    // // let host = "http://" + ip + ":9001/";
    // let host = "./";
    // let url = host + "scene/" + id + "/scene.json"
    // console.log("url=", url);
    // const response = await fetch(url, {})
    // const sceneData = await response.json();
    // console.log(sceneData)
    // loadAndRender(sceneData, host, updateModel)
}

function loadAndRender(sceneData: any, host: string, updateModel = false) {
    //let ip = osHelper.getIPAdress();
    // let host = "http://" + ip + ":9001/"
    for (let i = 0; i < sceneData.models.length; i++) {
        let modelId = sceneData.models[i].common_model_id

        let loader = new ModelLoader2();
        let filePath = host + sceneData.models[i].su_3d_path;
        let mx = new Matrix4();
        let pInfo = JSON.parse(sceneData.models[i].position_info);
        mx.elements = pInfo.transformation;



        // 旋转
        let mq = new THREE.Matrix4();
        mq.makeRotationX(-Math.PI / 2);
        mx.premultiply(mq);



        loader.load(filePath, (geometry: Geometry, materials: THREE.MeshLambertMaterial[], textureDataList: any[]) => {
            let bufferGeometry = geometry.toBufferGeometry();
            let mesh: any = new THREE.Mesh(bufferGeometry, materials);
            mesh.applyMatrix4(mx);


            scene.add(mesh)

            if (updateModel) {
                //saveLevelFile(sceneData.scene.id, modelId, geometry, materials, textureDataList)
            }
            render();
        });
    }
}



</script>