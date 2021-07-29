import { Model3d, Line3d, Point3d, Face, Loop, Vertex, LocationCurve, Wall } from "@wanwei/modeldef";
import * as THREE from "three";
import { Geometry } from "./Geometry";
import { Line2d, Model2d, Point2d, Polyline2d } from "@wanwei/modeldef";
import { Convert } from "./model3d/convert";

class WallDataEx {
    wall: Wall = null;

    /**
     * 起始端是处理过了
     */
    startNodeProcessed: boolean = false;

    /**
     * 终止端是否处理过了
     */
    endNodeProcessed: boolean = false;

    /**
     * 左侧（逆时针侧）
     */
    edgeLeft: Line2d = null;

    /**
     * 右侧（顺时针侧）
     */
    edgeRight: Line2d = null;

    /**
     * 定位线
     */
    locationLine: Line2d = null;

    constructor(wall: Wall) {
        this.wall = wall;
    }
}

function createModel3d(geometry: THREE.BufferGeometry): Model3d {
    let model3d = new Model3d();

    let geom = new Geometry();
    geom.fromBufferGeometry(geometry);
    geom.mergeVertices();

    // 加入面
    for (let i = 0; i < geom.faces.length; i++) {
        let face = geom.faces[i];
        //console.log("face=", face);
        let wwFace = new Face();
        let loop = new Loop();
        loop.vertices.push(face.a);
        loop.vertices.push(face.b);
        loop.vertices.push(face.c);
        loop.outer = true;
        wwFace.loops.push(loop);
        wwFace.entityID = i;
        model3d.entities.push(wwFace);
    }

    // 加入顶点
    for (let i = 0; i < geom.vertices.length; i++) {
        let vertex = geom.vertices[i];
        //console.log("vertex=", vertex);
        let wwVertex = new Vertex();
        wwVertex.entityID = i;
        wwVertex.position = new Point3d(vertex.x, vertex.y, vertex.z);
        //model3d.vertices.push(wwVertex);
        model3d.vertices[i] = wwVertex;
    }

    return model3d;
}

function createModel2d(polyline:Polyline2d) : Model2d{
    let model2d = new Model2d();
    model2d.entities.push(polyline);

    return model2d;
}

function processStartNode(wallExData: WallDataEx, wallList: WallDataEx[], scene:THREE.Scene) {
    let wall = wallExData.wall;

    // 如果墙边线还未建立，则建立之
    // if(wallExData.edgeLeft == null || wallExData.edgeRight == null)
    // {
    //   // 未建立
    //   createEdges(wallExData);
    // }

    // 找出起点端的所有墙，这是按优先顺序排的
    if (wall.location.type == "LocationCurve") {
        let locationCurve = wall.location as LocationCurve;
        let wallIds = locationCurve.ElementsAtJoins[0];

        processNode(wallIds, wallList, scene);
    }

    wallExData.startNodeProcessed = true;
}

function processNode(wallIds: number[], wallList: WallDataEx[], scene:THREE.Scene) {
    // 处理最优先和次优先的墙
    if (wallIds.length >= 2) {
        let wall1 = getWallDataEx(wallIds[0], wallList);
        let wall2 = getWallDataEx(wallIds[1], wallList);
        fillet(wall1, wall2, scene);

        // 测试，绘制出来
        // drawWallEdges(wall1, scene);
        // drawWallEdges(wall2, scene);

        let processedWallList: WallDataEx[] = [];
        processedWallList.push(wall1);
        processedWallList.push(wall2);
        for (let i = 2; i < wallIds.length; i++) {
            let wallDataEx = getWallDataEx(wallIds[i], wallList);
            //trim(wallDataEx, processedWallList);
        }
    }
}

function processEndNode(wallExData: WallDataEx, wallList: WallDataEx[], scene:THREE.Scene) {
    let wall = wallExData.wall;

    // 如果墙边线还未建立，则建立之
    // if(wallExData.edgeLeft == null || wallExData.edgeRight == null)
    // {
    //   // 未建立
    //   createEdges(wallExData);
    // }

    // 找出起点端的所有墙，这是按优先顺序排的
    if (wall.location.type == "LocationCurve") {
        let locationCurve = wall.location as LocationCurve;
        let wallIds = locationCurve.ElementsAtJoins[1];

        processNode(wallIds, wallList, scene);
    }

    wallExData.endNodeProcessed = true;
}

function createEdges(wallExData: WallDataEx) {
    let wall = wallExData.wall;

    // 定位线
    if (wall.location.type == "LocationCurve") {
        let locationCurve = wall.location as LocationCurve;
        if (locationCurve.Curve.type == "Line3d") {
            let line3d = locationCurve.Curve as Line3d;

            // 变成2d的线来使用
            let line2d = Convert.toLine2d(line3d);

            // 设置定位线
            //wallExData.locationLine = line2d;

            // 确定墙的左侧边线和右侧边线
            let vec = line2d.endPoint.subtractPoint(line2d.startPoint).normal;
            if (vec.length > 1e-6) {
                // 起点和终点不重合
                // 求起点处的两个端点
                let vecRotated = vec.rotateBy(Math.PI / 2);

                // 左侧边线
                if (wallExData.edgeLeft == null) {
                    let ptStartLeft = line2d.startPoint.add(vecRotated.multiplyScalar(wall.width / 2));
                    let ptEndLeft = line2d.endPoint.add(vecRotated.multiplyScalar(wall.width / 2));
                    wallExData.edgeLeft = new Line2d(ptStartLeft, ptEndLeft);
                }
                // 求终点处的两个端点
                if (wallExData.edgeRight == null) {
                    let ptStartRight = line2d.startPoint.add(vecRotated.multiplyScalar(-wall.width / 2));
                    let ptEndRight = line2d.endPoint.add(vecRotated.multiplyScalar(-wall.width / 2));
                    wallExData.edgeRight = new Line2d(ptStartRight, ptEndRight);
                }

            }
        }
    }

}

function getWallDataEx(wallId: number, wallList: WallDataEx[]): WallDataEx {
    for (let i = 0; i < wallList.length; i++) {
        if (wallList[i].wall.id == wallId) {
            return wallList[i];
        }
    }

    return null;
}

function fillet(wall1: WallDataEx, wall2: WallDataEx, scene:THREE.Scene) {
    if (wall1.edgeLeft == null || wall1.edgeRight == null || wall1.locationLine == null
        || wall2.edgeLeft == null || wall2.edgeRight == null || wall2.locationLine == null) {
        return;
    }

    let reverse = false;
    // 判断 wall1 和 wall2 是否连成一顺
    if (wall1.locationLine.startPoint.getDistanceTo(wall2.locationLine.startPoint) < 1e-3) {
        // wall1的起点与wall2的起点连接，不顺
        reverse = true;
    }
    else if (wall1.locationLine.startPoint.getDistanceTo(wall2.locationLine.endPoint) < 1e-3) {
        // wall1的起点与wall2的终点连接，顺
    }
    else if (wall1.locationLine.endPoint.getDistanceTo(wall2.locationLine.startPoint) < 1e-3) {
        // wall1的终点与wall2的起点连接，顺
    }
    else if (wall1.locationLine.endPoint.getDistanceTo(wall2.locationLine.endPoint) < 1e-3) {
        // wall1的终点与wall2的终点连接，不顺
        reverse = true;
    }

    let leftEdge2: Line2d;
    let rightEdge2: Line2d;
    if (reverse) {
        // 不顺
        leftEdge2 = wall2.edgeRight;
        rightEdge2 = wall2.edgeLeft;
    }
    else {
        // 顺
        leftEdge2 = wall2.edgeLeft;
        rightEdge2 = wall2.edgeRight;
    }

    filletEdge(wall1.edgeLeft, leftEdge2, scene);
    filletEdge(wall1.edgeRight, rightEdge2, scene);

    // 测试，绘制
    // drawLine(wall1.edgeLeft, scene);
    // drawLine(leftEdge2, scene);
    //drawLine(wall1.edgeRight, scene);
    //drawLine(rightEdge2, scene);
}

function filletEdge(edge1: Line2d, edge2: Line2d, scene:THREE.Scene) {
    // 求交点，包括延长线
    let pt = edge1.intersectWith(edge2, true, true);
    console.log("pt=", pt);

    // 测试，将点画出来
    // if(pt.getDistanceTo(new Point2d(-9.38, 0.99)) < 0.01){
    //     drawCircle(pt, 0.05, scene, 0xff0000);
    //     drawCircle(edge1.startPoint, 0.06, scene, 0x00ff00);
    //     drawCircle(edge1.endPoint, 0.06, scene, 0x00ff00);
    //     drawCircle(edge2.startPoint, 0.07, scene, 0x0000ff);
    //     drawCircle(edge2.endPoint, 0.07, scene, 0x0000ff);
    // }

    if (pt) {
        // 有且只有一个交点
        // 看起点和终点到交点的距离，保留远的一端，将近的一端改为交点
        // edge1
        {
            let distStart = edge1.startPoint.getDistanceTo(pt);
            let distEnd = edge1.endPoint.getDistanceTo(pt);
            if (distStart < distEnd) {
                // 终点距离交点较远，保留终点，修改起点
                edge1.startPoint = pt.clone();
            } else {
                // 起点离交点较远，保留起点，修改终点
                edge1.endPoint = pt.clone();
            }
        }
        // edge2
        {
            let distStart = edge2.startPoint.getDistanceTo(pt);
            let distEnd = edge2.endPoint.getDistanceTo(pt);
            if (distStart < distEnd) {
                // 终点距离交点较远，保留终点，修改起点
                edge2.startPoint = pt.clone();
            } else {
                // 起点离交点较远，保留起点，修改终点
                edge2.endPoint = pt.clone();
            }
        }

        // 测试
        // drawCircle(edge1.endPoint, 0.06, scene, 0x00ff00);
        // drawLine(edge1, scene);
        // drawLine(edge2, scene);
    }
}

function drawWallEdges(wallData: WallDataEx, scene:THREE.Scene){
    drawLine(wallData.edgeLeft, scene);
    drawLine(wallData.edgeRight, scene);
}

function drawLine(line:Line2d, scene:THREE.Scene){
    const geometry1 = new THREE.BufferGeometry();
    let vertices:number[] = [];
    vertices.push(line.startPoint.x, line.startPoint.y, 0);
    vertices.push(line.endPoint.x, line.endPoint.y, 0);
    geometry1.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    let lineObj = new THREE.Line( geometry1 );
    lineObj.rotateX(-Math.PI/2);

	scene.add( lineObj );
}

function drawCircle(center:Point2d, radius:number, scene:THREE.Scene, color:number){
    const geometry = new THREE.CircleGeometry( radius, 6 );
    const material = new THREE.LineBasicMaterial( { color: color } );
    const circle = new THREE.Mesh( geometry, material );
    circle.translateX(center.x);
    circle.translateZ(-center.y);
    circle.rotateX(-Math.PI/2);
    scene.add( circle );
}

export {
    WallDataEx,
    createModel3d,
    createEdges,
    processStartNode,
    processEndNode,
    drawWallEdges,
    createModel2d
}

