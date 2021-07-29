<template>
  <div>
    <div id="panel">
      建模测试
      <button @click="verticalExtrude">垂直拉伸</button>
      <button @click="polylineExtrude">封闭多段线拉伸</button>
      <button @click="createWalls">创建墙</button>
    </div>
  </div>
</template>

<script lang="ts">
import * as THREE from "three";
import { OrbitControls } from "./OrbitControls";
import { DoubleSide, PointLight } from 'three';
import { Polyline2d, Point2d } from "@wanwei/modeldef"
import { Wall } from "@wanwei/modeldef"
import { createEdges, createModel3d, drawWallEdges, processEndNode, processStartNode, WallDataEx } from "./ModelingFunctions"

export default {
  data(){
    return {};
  },
  mounted(){
    console.log("mounted");
		init();
  },
  methods:{
    verticalExtrude(){
      const length = 12, width = 8;

      const shape = new THREE.Shape();
      shape.moveTo( 0,0 );
      shape.lineTo( 0, width );
      shape.lineTo( length, width );
      shape.lineTo( length, 0 );
      shape.lineTo( 0, 0 );

      // const extrudeSettings = {
      //   steps: 2,
      //   depth: 16,
      //   bevelEnabled: true,
      //   bevelThickness: 1,
      //   bevelSize: 1,
      //   bevelOffset: 0,
      //   bevelSegments: 1
      // };
      const extrudeSettings = {
        steps: 1,
        depth: 16,
        curveSegments:1,
        bevelEnabled: false
      };

      const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
      const material = new THREE.MeshLambertMaterial( { 
        color: 0x156289, emissive: 0x072534, side: DoubleSide,
      } );
      const mesh = new THREE.Mesh( geometry, material ) ;
      scene.add( mesh );

      render();
    },
    polylineExtrude(){
      // 封闭多段线
      let polyline = new Polyline2d();
      polyline.points = [
        new Point2d(0, 0),
        new Point2d(10, 0),
        new Point2d(10, 0.3),
        new Point2d(0, 0.3),
      ];
      polyline.closed = true;

      // 高度3m
      let height = 3;

      // 拉伸
      extrudePolyline(polyline, height);
    },

    async createWalls(){
      // 从wall.json中读取数据
      let url = "./data/wall-L.json"
      const response = await fetch(url, { mode: "cors" });
      let walls = await response.json() as Wall[];

      // 将墙数据与附加数据绑在一起，放进列表里
      let wallList:WallDataEx[] = [];
      for(let i = 0; i < walls.length; i++){
        let wall = walls[i];
        let wallEx = new WallDataEx(wall);
        createEdges(wallEx);
        wallList.push(wallEx);
      }

      // 循环一遍，处理
      for(let i = 0; i < wallList.length; i++){
        let wallDataEx = wallList[i];

        console.log("createWalls, i=", i)

        if(!wallDataEx.startNodeProcessed){
          // 起点端还没处理
          processStartNode(wallDataEx, wallList, scene);
        }

        if(!wallDataEx.endNodeProcessed){
          // 终止端还没处理
          processEndNode(wallDataEx, wallList, scene);
        }

        //break;

      }

      // 测试，循环一遍，绘制墙边线
      // for(let i = 0; i < wallList.length; i++){
      //   let wallDataEx = wallList[i];
      //   drawWallEdges(wallDataEx, scene);
      // }

      // 测试，直接返回
      // render();
      // return;

      // 再循环一遍，绘制
      for(let i = 0; i < wallList.length; i++){
        let wallDataEx = wallList[i];
        let wall = wallDataEx.wall;
        if(wallDataEx.edgeLeft != null && wallDataEx.edgeRight != null){
          // 构造封闭多段线
          let polyline = new Polyline2d();
          polyline.points = [
            wallDataEx.edgeLeft.startPoint,
            wallDataEx.edgeLeft.endPoint,
            wallDataEx.edgeRight.endPoint,
            wallDataEx.edgeRight.startPoint,
          ];
          polyline.closed = true;

          extrudePolyline(polyline, wall.height);
        }
      }
    }
  }
}

let renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera;

function init(){
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

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.x = 0;
    directionalLight.position.y = 0;
    directionalLight.position.z = 10;
    scene.add(directionalLight);
    scene.add(directionalLight.target);

    console.log("平行光");

 			const lights = [];
			lights[ 0 ] = new PointLight( 0xffffff, 1, 0 );
			lights[ 1 ] = new PointLight( 0xffffff, 1, 0 );
			lights[ 2 ] = new PointLight( 0xffffff, 1, 0 );

			lights[ 0 ].position.set( 0, 200, 0 );
			lights[ 1 ].position.set( 100, 200, 100 );
			lights[ 2 ].position.set( - 100, - 200, - 100 );

			scene.add( lights[ 0 ] );
			scene.add( lights[ 1 ] );
			scene.add( lights[ 2 ] );


    camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );
    // camera = new THREE.OrthographicCamera(-20, 20, 10, -10);
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

    render();
}

function render() {
  renderer.render(scene, camera);
}

function extrudePolyline(polyline:Polyline2d, height:number){
  const shape = new THREE.Shape();

  if(polyline.points.length < 2){
    return;
  }

  let pt = polyline.points[0];
  shape.moveTo(pt.x, pt.y);
  for(let i = 0; i < polyline.points.length; i++){
    let pt = polyline.points[(i+1) % polyline.points.length];
    shape.lineTo( pt.x, pt.y );
  }

  const extrudeSettings = {
    steps: 1,
    depth: height,
    curveSegments:1,
    bevelEnabled: false
  };

  const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
  const material = new THREE.MeshLambertMaterial( { 
    color: 0x156289, emissive: 0x072534, side: DoubleSide,
  } );
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh( geometry, material ) ;
  mesh.rotateX(-Math.PI/2);
  scene.add( mesh );

  // 生成标准三维格式
  let model3d = createModel3d(geometry);

  console.log("model3d.vertices=", model3d.vertices);

    // 转换vertices
    let vertices = Array.from(model3d.vertices)
    let verticesArr = []
    for (let i in vertices) {
      verticesArr.push(vertices[i][1])
    }

    let xhr = new XMLHttpRequest()
    const url = 'https://wwbim.com/stage/api/v1/commonmodels/uploadModel'
    let name = '墙体1'

    const modelInfo = {
      model3d: {
        entities: model3d.entities,
        materials: model3d.materials,
        vertices: verticesArr,
        componentDefinitions: model3d.componentDefinitions
      },
      name,
    }

    xhr.open('POST', url)
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8')
    xhr.onloadend = function () {
      console.log('上传结束')
    }
    xhr.send(JSON.stringify(modelInfo))


  render();
}


</script>

<style scope>
#panel{
  z-index: 2;
  position:absolute;
}
</style>

