<template>
  <div>TestScene2</div>
</template>

<script lang="ts">
import * as THREE from "three";
import { OrbitControls } from "./OrbitControls";
import { Box3, Matrix4, NormalBlending } from "three";
import ModelLoader2 from "./ModelLoader2";
import { Geometry } from "./Geometry";
import { GeometryInfo } from "./model3d/GeometryInfo";

let renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera;
let totalVerticesCount: number;
let modelCount: number;
let materialMap = new Map<string, THREE.Material[]>();
let geometryMap = new Map<string, THREE.BufferGeometry>();
let modelMap = new Map<string, ModelAndMesh>();
let materialCount: number;
let geometryCount: number;
let sceneInfo: SceneInfo;

class ModelAndMesh {
  model: Model = null;
  mesh: THREE.Mesh = null;
}

export default {
  data() {
    return {};
  },
  mounted() {
    totalVerticesCount = 0;
    modelCount = 0;
    materialCount = 0;
    geometryCount = 0;

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
    //camera.position.z = 15;
    camera.position.x = 10;
    camera.position.y = 20;
    camera.position.z = 30;
    camera.lookAt(10, 0, -10);

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

    //loadScene(38);
    loadScene(49);

    render();
  },
};

function render() {
  renderer.render(scene, camera);
}

class SceneInfo {
  models: Model[] = [];
}

class Model {
  id: number;
  modelId: number;
  boundBox: Box3; //准备数据的时候生成，省得每次鼠标事件都生成
  position: Matrix4; //准备数据的时候生成，省得每次鼠标事件都生成
  //把GeometryInfo放到这里减少以后对此信息的循环获取
  geometryInfo: GeometryInfo = null;

  position_info: string; //与position重复，但为了统一加载

  filePath: string;
  //计算得到的文件名
  toLoadFile: string;
  toVerticeCount: number = 0;

  screenArea: number;

  onScreen: boolean = true; //在屏幕内

  //当前选取的模型级别，0-10，越小越精确
  modelLevel: number = -1;
  //实际密度
  expectDensity: number = 0;

  //偏差系数
  offsetRatio: number = 0;

  //已经到最差模型了
  overflow: boolean = false;
}

async function loadScene(id: number, updateModel = false) {
  //49
  const sceneQuery = {
    id: id,
    mode: 1,
  };

  try {
    const response = await fetch("api/v1/scene/querySceneData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(sceneQuery),
      mode: "cors",
    });

    let r = await response.json();
    if (r.msg != "ok") {
      alert("未取到数据");
      return;
    }

    console.log("r=", r);

    let sceneData = r.data;
    let host = "./";

    //加载各模型的geomInfo.json文件
    sceneInfo = new SceneInfo();
    for (let i = 0; i < sceneData.models.length; i++) {
      //todo:zy 注意模型多实例处理
      let item = sceneData.models[i];

      let m = new Model();
      m.id = item.instanceId;
      m.modelId = item.common_model_id;

      if (item.product_id != null) {
        if (item.product_file_path == null) continue;
        m.filePath = host + item.product_file_path;
      } else {
        if (item.su_3d_path == null) continue;
        m.filePath = host + item.su_3d_path;
      }

      let geomInfo: any = getGeomInfoFromModels(sceneInfo.models, m.modelId);
      if (geomInfo == null) {
        let url = m.filePath + "geomInfo.json";
        // console.log(url)

        const response = await fetch(url, { mode: "cors" });
        geomInfo = await response.json();
      }

      m.geometryInfo = geomInfo;

      m.position_info = item.position_info;

      let mx = new Matrix4();
      let pInfo = JSON.parse(item.position_info);
      mx.elements = pInfo.transformation;
      // 旋转
      let mq = new THREE.Matrix4();
      mq.makeRotationX(-Math.PI / 2);
      mx.premultiply(mq);
      m.position = mx;

      let box3 = new Box3();
      box3.min = new THREE.Vector3(
        geomInfo.boundingBox.min.x,
        geomInfo.boundingBox.min.y,
        geomInfo.boundingBox.min.z
      );
      box3.max = new THREE.Vector3(
        geomInfo.boundingBox.max.x,
        geomInfo.boundingBox.max.y,
        geomInfo.boundingBox.max.z
      );

      m.boundBox = box3;
      sceneInfo.models.push(m);
    }

    console.log("sceneInfo=", sceneInfo);

    loadAndRender_optimize2(sceneInfo);
  } catch (ex) {
    console.log(ex);
  }
}

function getGeomInfoFromModels(models: Model[], modelId: number) {
  for (let i = 0; i < models.length; i++) {
    let item = models[i];
    if (item.modelId == modelId && item.geometryInfo != null) {
      return item.geometryInfo;
    }
  }

  return null;
}

async function loadAndRender_optimize2(sceneInfo: SceneInfo) {
  sceneInfo.models.forEach((model) => {
    load(model);
  });
}

async function load(model: Model) {
  // 只加载包围盒
  // let boundingBox = model.boundBox;
  // let width = boundingBox.max.x - boundingBox.min.x;
  // let height = boundingBox.max.y - boundingBox.min.y;
  // let depth = boundingBox.max.z - boundingBox.min.z;
  // let boxGeom = new THREE.BoxBufferGeometry(width, height, depth);
  // let mesh = new THREE.Mesh(boxGeom);

  //let index = model.geometryInfo.lodGeometryInfoList.length - 1;
  let index = 0;
  let lodGeometryInfo = model.geometryInfo.lodGeometryInfoList[index];
  let fileName = lodGeometryInfo.fileName;
  let filePath = model.filePath + fileName;
  let materialFileName = model.filePath + "materials.json";

  // 加入模型字典
  let modelAndMesh = new ModelAndMesh();
  modelAndMesh.model = model;

  modelMap.set(model.id.toString(), modelAndMesh);

  // 加载模型
  if (!geometryMap.has(filePath)) {
    // 先设为空，把位置占上，以免后面await时造成重复加载
    geometryMap.set(filePath, null);
    const response = await fetch(filePath, { mode: "cors" });
    const obj = await response.json();
    let newGeometry = createGeometryFromJson(obj);
    geometryMap.set(filePath, newGeometry);
    geometryCount++;
    createMeshes(filePath, null);
  }

  // 加载材质
  let materials: THREE.Material[];
  if (!materialMap.has(materialFileName)) {
    // 先设为空，把位置占上，以免后面await时造成重复加载
    materialMap.set(materialFileName, null);
    materials = await getMeterials(materialFileName, model.filePath);
    materialMap.set(materialFileName, materials);
    materialCount++;
    createMeshes(null, materialFileName);
  }
}

function createGeometryFromJson(jsonObj) {
  var loader = new THREE.ObjectLoader();
  var geometries = loader.parseGeometries([jsonObj]);

  for (let key in geometries) {
    let geometry = geometries[key];
    return geometry;
  }
}

async function getMeterials(materialFileName: string, filePath: string) {
  const response = await fetch(materialFileName, { mode: "cors" });
  const matDataList = await response.json();

  //let matDataList = JSON.parse(matJsonStr);
  let materials = [];
  for (let i = 0; i < matDataList.length; i++) {
    let matData = matDataList[i];
    let material = new THREE.MeshLambertMaterial({
      wireframe: matData.wireframe,
      side: matData.side,
      shadowSide: matData.shadowSide,
      color: new THREE.Color(matData.color.r, matData.color.g, matData.color.b),
    });

    if (matData.opacity !== undefined) {
      material.opacity = matData.opacity;
    }
    if (matData.transparent !== undefined) {
      material.transparent = matData.transparent;
    }
    if (matData.blending !== undefined) {
      material.blending = matData.blending;
    }
    if (matData.textureFileName !== undefined) {
      // 读取贴图文件
      let name = matData.textureFileName;
      let texture = new THREE.TextureLoader().load(
        filePath + "texture/" + name
      );
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      material.map = texture;
    }
    // 修正一下
    console.log("material.opacity=", material.opacity);
    if (material.opacity < 1) {
      material.transparent = true;
      material.blending = NormalBlending;
    }
    materials.push(material);
  }

  return materials;
}

function createMeshes(geometryFilePath, materialFilePath) {
  console.log(
    "geometryCount=%d materialCount=%d modelMap.size=%d",
    geometryCount,
    materialCount,
    modelMap.size
  );

  let added = false;
  modelMap.forEach((value) => {
    console.log("value=", value);
    if (value.mesh != null) {
      return;
    }

    let model = value.model;
    let index = 0;
    let lodGeometryInfo = model.geometryInfo.lodGeometryInfoList[index];
    let fileName = lodGeometryInfo.fileName;

    let filePath = model.filePath + fileName;
    let geometry = geometryMap.get(filePath);
    if (geometry == null) {
      return;
    }

    let materialFileName = model.filePath + "materials.json";
    let materials = materialMap.get(materialFileName);
    if (materials == null) {
      return;
    }

    // materials.forEach(m=>{
    //   if (m.opacity < 1){
    //     m.transparent = true;
    //     m.blending = NormalBlending;
    //   }
    // })

    let mesh = new THREE.Mesh(geometry, materials);
    mesh.applyMatrix4(model.position);
    modelCount++;
    totalVerticesCount += lodGeometryInfo.verticesCount;
    console.log(
      "modelCount=%d verticesCount=%d, totalVerticesCount=%d",
      modelCount,
      lodGeometryInfo.verticesCount,
      totalVerticesCount
    );
    value.mesh = mesh;
    scene.add(mesh);
    added = true;
  });

  if (added) {
    render();
  }
}
</script>