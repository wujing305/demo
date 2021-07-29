import local_cad from "@/api/local_cad";
import { Vector2 } from "@/assets/js/three/three.module";
import * as THREE from "three";
import { DoubleSide } from "three";
import { Point2d, Polyline2d, Vector2d } from "../model2d/model2d";
import { createModel2d, createModel3d } from "../ModelingFunctions";


async function extrudePolyline(polyline: Polyline2d, insertPt:Point2d, category:string,  modelName:string,project_id:number, extrudeHeight: number, elev:number):Promise<number> {
    const shape = new THREE.Shape();

    if (polyline.points.length < 2) {
        return;
    }

    // 将polyline的点全部处理一下，减去插入点
    let vec = new Vector2d(insertPt.x, insertPt.y);
    for(let i = 0; i < polyline.points.length; i++){
        let pt = new Point2d(polyline.points[i].x, polyline.points[i].y);
        polyline.points[i] = pt.subtractVector(vec);
    }

    let pt = polyline.points[0];
    shape.moveTo(pt.x, pt.y);
    for (let i = 0; i < polyline.points.length; i++) {
        let pt = polyline.points[(i + 1) % polyline.points.length];
        shape.lineTo(pt.x, pt.y);
    }

    const extrudeSettings = {
        steps: 1,
        depth: extrudeHeight,
        curveSegments: 1,
        bevelEnabled: false
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshLambertMaterial({
        color: 0x156289, emissive: 0x072534, side: DoubleSide,
    });
    geometry.computeVertexNormals();

    // 生成标准三维格式
    let model3d = createModel3d(geometry);

    // 生成标准二维格式
    let model2d = createModel2d(polyline);

    console.log("model3d.vertices=", model3d.vertices);

    // 转换vertices
    // let vertices = Array.from(model3d.vertices)
    // let verticesArr = []
    // for (let i in vertices) {
    //     verticesArr.push(vertices[i][1])
    // }

    let name = modelName;
//    let category = '02';

    const modelInfo = {
        project_id:project_id,
        model3d: model3d,
        model2d: model2d,
        name, // 如果没有此参数，默认模型名称: (none)
        category, // 如果没有此参数，默认分类: 02 （椅子）
    }

    let url = 'api/v1/productions/uploadModelJson'

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(modelInfo),
        mode: 'cors',
    });

    const result = await response.json();
    if (result.msg == 'ok') {
        const modelId = result.modelId;
        console.log('模型ID：', modelId);
        return modelId;//by zy 2021-3-10
        //local_cad.localFun()
    } else {
        console.log('上传失败！')
        return null;//by zy 2021-3-10
    }
}

export {extrudePolyline}
