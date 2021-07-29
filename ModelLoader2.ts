import { Matrix4 } from 'three'
import * as THREE from 'three'
import {Face3} from './Face3'
import { Model3d } from './model3d/model3d';
import { Geometry } from './Geometry'
import { ShapeGeometryEx } from './ShapeGeometryEx'

class ModelLoader2 {
    load(path: string, callback: Function,filename:string=undefined) {
        let fileLoader = new THREE.FileLoader(THREE.DefaultLoadingManager);

        let file = ""
        if (filename == undefined){
            file = path + "model.json?=" + Date.now();
        }else{
            file = path + filename + "?=" + Date.now();
        }
         
        let scale = 1;

        let mx = new Matrix4();

        fileLoader.load(file, function (text) {
            if (typeof (text) == "string") {
                let json = JSON.parse(text);
                let vertices = [];
                let uvs = [];
                let loaded = { vs: false, uvs: false };

                let model3d = json as Model3d;

                // 准备材料
                // 其实这里model3d.materials不是map，所以没办法用foreach
                let materials:THREE.MeshLambertMaterial[] = []; //0是默认材质
                let materialDataList:object[] = [];
                let materialsId = { 0: 0 };
                materials[0] = new THREE.MeshLambertMaterial({
                    wireframe: false,
                    side: THREE.DoubleSide,
                    shadowSide: THREE.BackSide,
                    color: new THREE.Color(0x888888)
                });
                {
                    let matData = {
                        wireframe: false,
                        side: THREE.DoubleSide,
                        shadowSide: THREE.BackSide,
                        color: {
                            r: materials[0].color.r,
                            g: materials[0].color.g,
                            b: materials[0].color.b
                        }
                    };
                    materialDataList.push(matData);
                }
                for (let mKey in model3d.materials) {
                    materialsId[mKey] = materials.length;
                    let mat = new THREE.MeshLambertMaterial({
                        wireframe: false,
                        side: THREE.DoubleSide,
                        shadowSide: THREE.BackSide
                    });
                    mat.opacity = model3d.materials[mKey].alpha;
                    if (mat.opacity < 1) {
                        mat.transparent = true;
                        mat.blending = THREE.NormalBlending;
                    }

                    mat.color = new THREE.Color((model3d.materials[mKey].color & 0xff) / 255,
                        ((model3d.materials[mKey].color & 0xff00) >> 8) / 255,
                        ((model3d.materials[mKey].color & 0xff0000) >> 16) / 255);

                    let matData = {
                        wireframe: false,
                        side: THREE.DoubleSide,
                        shadowSide: THREE.BackSide,
                        color: {
                            r: mat.color.r,
                            g: mat.color.g,
                            b: mat.color.b
                        }
                    } as any;

                    if (model3d.materials[mKey].texture) {
                        //let name = json.materials[mKey].texture.filename.substring(json.materials[mKey].texture.filename.lastIndexOf("\\") + 1);
                        let name = model3d.materials[mKey].texture.entityID + ".jpg";
                        let texture = new THREE.TextureLoader().load(path + "texture/" + name);
                        texture.wrapS = THREE.RepeatWrapping;
                        texture.wrapT = THREE.RepeatWrapping;
                        mat.map = texture;

                        // 取得贴图数据
                        matData.textureFileName = name;
                    }

                    mat.name = model3d.materials[mKey].name;
                    materials.push(mat);

                    matData.name = mat.name;
                    matData.opacity = mat.opacity;//add by zy 2021-02-18
                    materialDataList.push(matData);
                }


                // 加载顶点数据
                let responseType = fileLoader.responseType;
                fileLoader.setResponseType("arraybuffer");

                // file = path + "vertices.dat?=" + Date.now();
                file = path + "vertices.dat";
                fileLoader.load(file, function (data) {
                    let reader = new DataView(data as ArrayBufferLike);
                    let ptr = 0;
                    let length = reader.getUint32(ptr, true)
                    console.log("length=", length);
                    ptr += 4;
                    for (let i = 0; i < length; i++) {
                        let vId = reader.getUint32(ptr, true)
                        ptr += 4;
                        vertices[vId] = new THREE.Vector3(
                            reader.getFloat32(ptr, true),
                            reader.getFloat32(ptr + 4, true),
                            reader.getFloat32(ptr + 8, true)
                        )
                        ptr += 12;
                    }
                    loaded.vs = true;
                    parse(loaded, vertices, uvs, materials, materialsId, model3d.componentDefinitions, model3d.entities, materialDataList);
                });

                //file = path + "uvs.dat?=" + Date.now();
                file = path + "uvs.dat";
                fileLoader.load(file, function (data) {
                    let reader = new DataView(data as ArrayBufferLike);
                    let ptr = 0;
                    let length = reader.getUint32(ptr, true)
                    ptr += 4;
                    for (let i = 0; i < length; i++) {
                        let size = reader.getUint32(ptr, true)
                        ptr += 4;
                        uvs[i] = []
                        for (let j = 0; j < size; j++) {
                            uvs[i][j] = [
                                reader.getFloat32(ptr, true),
                                reader.getFloat32(ptr + 4, true),
                                reader.getFloat32(ptr + 8, true)
                            ]
                            ptr += 12;
                        }
                    }
                    loaded.uvs = true;
                    parse(loaded, vertices, uvs, materials, materialsId, model3d.componentDefinitions, model3d.entities, materialDataList);
                });

                fileLoader.setResponseType(responseType);
            }
        });

        //解析文件
        function parse(loaded, vertices, uvs, materials, materialsId, componentDefinitions, entities, materialDataList) {
            if (loaded.vs && loaded.uvs) {
                let entity = parseEntities(vertices, uvs, materialsId, componentDefinitions, entities)
                // let tx = 0, ty = 0, tz = 0;
                //let mesh = new THREE.Mesh(new THREE.BufferGeometry(), materials);

                if (entity.hasGeomtry) {
                    // entity.geometry.scale(scale, scale, scale);
                    // entity.geometry.rotateX(-Math.PI / 2);
                    // entity.geometry.computeBoundingBox();
                    // tx = (entity.geometry.boundingBox.min.x - entity.geometry.boundingBox.max.x) / 2 - entity.geometry.boundingBox.min.x;
                    // ty = -entity.geometry.boundingBox.min.y;
                    // tz = (entity.geometry.boundingBox.min.z - entity.geometry.boundingBox.max.z) / 2 - entity.geometry.boundingBox.min.z;
                    // entity.geometry.translate(tx, ty, tz);
                    entity.geometry.computeVertexNormals();
                    //var bufferGeometry = new BufferGeometry().fromGeometry(entity.geometry);
                    console.log("faces.length=", entity.geometry.faces.length);
                    // let bufferGeometry = entity.geometry.toBufferGeometry();
                    // mesh = new THREE.Mesh(bufferGeometry, materials);
                    callback(entity.geometry, materials, materialDataList)
                }

                // let p = new Vector3();
                // let q = new Quaternion();
                // let s = new Vector3();
                // mx.decompose(p, q, s);
                // p.multiplyScalar(0.01);
                // mx.compose(p, q, s);

                // let mq = new Matrix4();
                // mq.makeRotationX(-Math.PI / 2);
                // mx.premultiply(mq);
                // mesh.applyMatrix4(mx);

                //scope.editor.addObject(mesh);
                //scope.scene.add(mesh);
                // callback(mesh);
            }
        }

        function parseEntities(vertices, uvs, materialsId, componentDefinitions, entities) {
            let geometry = new Geometry();
            let hasGeomtry = false;
            let vsIndex = {};   //记录面的所有点ID对应的索引值
            for (let i = 0; i < entities.length; i++) {
                if (entities[i].typename === "ComponentInstance" || entities[i].typename === "Group") {
                    let matrix = new Matrix4();
                    matrix.elements = entities[i].transformation.array;

                    let entity = parseEntities(vertices, uvs, materialsId, componentDefinitions, componentDefinitions[entities[i].definition].entities)
                    if (entity.hasGeomtry) {
                        hasGeomtry = true;
                        geometry.merge(entity.geometry, matrix, 0);
                    }
                } else if (entities[i].typename === "Face") {
                    hasGeomtry = true;
                    if (entities[i].loops.length > 1 || entities[i].loops[0].vertices.length > 3) {
                        let triangleFaceEntities = [];
                        const shape = new THREE.Shape();
                        let basis = new Matrix4();
                        let basisInv = new Matrix4();
                        let vsID = [];  //记录点索引对应的点ID

                        for (let j = 0; j < entities[i].loops.length; j++) {
                            let vs = [];
                            for (let n = 0; n < entities[i].loops[j].vertices.length; n++) {
                                vs.push(vertices[entities[i].loops[j].vertices[n]].clone())
                                vsID.push(entities[i].loops[j].vertices[n]);

                                if (vsIndex[entities[i].loops[j].vertices[n]] === undefined) {
                                    vsIndex[entities[i].loops[j].vertices[n]] = geometry.vertices.length
                                    geometry.vertices.push(vertices[entities[i].loops[j].vertices[n]])
                                }
                            }

                            if (j === 0) {
                                let v0 = vs[0].clone()
                                let v1 = vs[1].clone()
                                let v2 = vs[2].clone()

                                let vOX = v1.sub(v0).normalize();
                                let vOY = v2.sub(v0).normalize();
                                let vOZ = vOX.clone().cross(vOY).normalize();
                                vOY = vOX.clone().cross(vOZ).normalize();

                                let basis0 = new Matrix4();
                                basis0.makeBasis(vOX, vOY, vOZ);
                                basis.makeTranslation(v0.x, v0.y, v0.z);
                                basis.multiply(basis0);
                                basisInv.copy(basis).invert();
                            }

                            for (let m = 0; m < vs.length; m++) {
                                vs[m].applyMatrix4(basisInv)
                            }

                            if (entities[i].loops[j].outer) {
                                shape.moveTo(vs[0].x, vs[0].y);
                                for (let m = 1; m < vs.length; m++) {
                                    shape.lineTo(vs[m].x, vs[m].y);
                                }
                            } else {
                                const path = new THREE.Path()
                                path.moveTo(vs[0].x, vs[0].y);
                                for (let m = 1; m < vs.length; m++) {
                                    path.lineTo(vs[m].x, vs[m].y);
                                }
                                shape.holes.push(path);
                            }
                        }

                        const shapeGeometry = new ShapeGeometryEx(shape);
                        for (let m = 0; m < shapeGeometry.faces.length; m++) {
                            let entitiy = {
                                typename: "Face",
                                materialID: entities[i].materialID,
                                back_material_ID: entities[i].back_material_ID,
                                loops: [{
                                    outer: true,
                                    vertices: [
                                        vsID[shapeGeometry.faces[m].a],
                                        vsID[shapeGeometry.faces[m].b],
                                        vsID[shapeGeometry.faces[m].c],
                                    ]
                                }]
                            }
                            if(entities[i].loops.length == 1){
                                if(entities[i].uvs){
                                    // @ts-ignore
                                    entitiy.uvs = [[uvs[entities[i].uvs][shapeGeometry.faces[m].a][0], uvs[entities[i].uvs][shapeGeometry.faces[m].a][1], 1],
                                        // @ts-ignore
                                        [uvs[entities[i].uvs][shapeGeometry.faces[m].b][0], uvs[entities[i].uvs][shapeGeometry.faces[m].b][1], 1],
                                        // @ts-ignore
                                        [uvs[entities[i].uvs][shapeGeometry.faces[m].c][0], uvs[entities[i].uvs][shapeGeometry.faces[m].c][1], 1]]
                                }
                                if(entities[i].back_uvs){
                                    // @ts-ignore
                                    entitiy.back_uvs = [[uvs[entities[i].back_uvs][shapeGeometry.faces[m].a][0], uvs[entities[i].back_uvs][shapeGeometry.faces[m].a][1], 1],
                                        // @ts-ignore
                                        [uvs[entities[i].back_uvs][shapeGeometry.faces[m].b][0], uvs[entities[i].back_uvs][shapeGeometry.faces[m].b][1], 1],
                                        // @ts-ignore
                                        [uvs[entities[i].back_uvs][shapeGeometry.faces[m].c][0], uvs[entities[i].back_uvs][shapeGeometry.faces[m].c][1], 1]]
                                }
                            }else{
                                let aa = entities[i].loops;
                            }
                            
                            triangleFaceEntities.push(entitiy);
                        }
                        for (let k = 0; k < triangleFaceEntities.length; k++) {
                            geometry.faces.push(new Face3(
                                vsIndex[triangleFaceEntities[k].loops[0].vertices[0]],
                                vsIndex[triangleFaceEntities[k].loops[0].vertices[1]],
                                vsIndex[triangleFaceEntities[k].loops[0].vertices[2]],
                                null,
                                null,
                                materialsId[triangleFaceEntities[k].materialID]))

                            if (triangleFaceEntities[k].uvs) {
                                geometry.faceVertexUvs[0].push(
                                    [new THREE.Vector2(triangleFaceEntities[k].uvs[0][0], triangleFaceEntities[k].uvs[0][1]),
                                        new THREE.Vector2(triangleFaceEntities[k].uvs[1][0], triangleFaceEntities[k].uvs[1][1]),
                                        new THREE.Vector2(triangleFaceEntities[k].uvs[2][0], triangleFaceEntities[k].uvs[2][1])]
                                )
                            } else {
                                geometry.faceVertexUvs[0].push(
                                    [new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2()]
                                )
                            }
                        }
                    } else {
                        for (let n = 0; n < entities[i].loops[0].vertices.length; n++) {
                            if (vsIndex[entities[i].loops[0].vertices[n]] === undefined) {
                                vsIndex[entities[i].loops[0].vertices[n]] = geometry.vertices.length
                                geometry.vertices.push(vertices[entities[i].loops[0].vertices[n]])
                            }
                        }

                        geometry.faces.push(new Face3(
                            vsIndex[entities[i].loops[0].vertices[0]],
                            vsIndex[entities[i].loops[0].vertices[1]],
                            vsIndex[entities[i].loops[0].vertices[2]],
                            null,
                            null,
                            materialsId[entities[i].materialID]))

                        if (entities[i].uvs) {
                            geometry.faceVertexUvs[0].push(
                                [new THREE.Vector2(uvs[entities[i].uvs][0][0], uvs[entities[i].uvs][0][1]),
                                    new THREE.Vector2(uvs[entities[i].uvs][1][0], uvs[entities[i].uvs][1][1]),
                                    new THREE.Vector2(uvs[entities[i].uvs][2][0], uvs[entities[i].uvs][2][1])]
                            )
                        } else {
                            geometry.faceVertexUvs[0].push(
                                [new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2()]
                            )
                        }
                    }
                } 
            }
            return {
                hasGeomtry: hasGeomtry,
                geometry: geometry,
            };
        }
    }
}

export default ModelLoader2;
