import { MathLib } from "../math/mathLib"

/**
 * 二维模型
 */
class Model2d {
    /**
     * 数据类型，程序可靠此项判断json文件为二维模型文件
     */
    type: string = "Model2d";

    /**
     * 格式版本号
     */
    version: string = "0.1";

    /**
     * 模型名称
     */
    name: string = "";

    /**
     * 实体数组, 每个元素都是Entity类的对象
     */
    entities: Entity[] = [];

}

/**
 * 实体
 */
class Entity {
    type: string = "";          // 数据类型，可能是Line、Circle等
}

/**
 * 曲线
 */
class Curve2d extends Entity {

}

/**
 * 直线段
 */
class Line2d extends Curve2d {

    constructor(startPoint = Point2d.Origin, endPoint = Point2d.Origin) {
        super();
        this.type = "line";
        this.startPoint = startPoint;
        this.endPoint = endPoint;
    }

    startPoint: Point2d = Point2d.Origin;   // 起点
    endPoint: Point2d = Point2d.Origin;     // 终点

    // 判断两条直线是否平行
    isParallelTo(line: Line2d): boolean {
        let vec1 = this.endPoint.subtractPoint(this.startPoint).normal;
        let vec2 = line.endPoint.subtractPoint(this.startPoint).normal;
        let value = Math.abs(vec1.dot(vec2));
        if (MathLib.approximate(value, 1, 1e-6)) {
            return true;
        }
        return false;
    }

    /**
     * 
     * @param other 
     */
    intersectWith(other: Line2d, extendThis:boolean = false, extendOther:boolean = false): Point2d {
        let a = this.startPoint;
        let b = this.endPoint;
        let c = other.startPoint;
        let d = other.endPoint;

        /** 1 解线性方程组, 求线段交点. **/
        // 如果分母为0 则平行或共线, 不相交 
        let denominator = (b.y - a.y) * (d.x - c.x) - (a.x - b.x) * (c.y - d.y);
        if (denominator == 0) {
            return null;
        }

        // 线段所在直线的交点坐标 (x , y)      
        let x = ((b.x - a.x) * (d.x - c.x) * (c.y - a.y)
            + (b.y - a.y) * (d.x - c.x) * a.x
            - (d.y - c.y) * (b.x - a.x) * c.x) / denominator;
        let y = -((b.y - a.y) * (d.y - c.y) * (c.x - a.x)
            + (b.x - a.x) * (d.y - c.y) * a.y
            - (d.x - c.x) * (b.y - a.y) * c.y) / denominator;

        if(!extendThis){
            // 不延长本线段
            // 判断交点是否在本线段上
            if((x - a.x) * (x - b.x) <= 0 && (y - a.y) * (y - b.y) <= 0){
                // 在本线段上
            }else{
                return null;
            }
        }

        if(!extendOther){
            // 不延长另一线段
            // 判断交点是否在另一线段上
            if((x - c.x) * (x - d.x) <= 0 && (y - c.y) * (y - d.y) <= 0){
                // 在另一线段上
            }else
            {
                return null;
            }
        }

        return new Point2d(x, y);

    }


}

/**
 * 二维点
 */
class Point2d {
    /**
     * X坐标，单位为m
     */
    x: number = 0;

    /**
     * Y坐标，单位为m
     */
    y: number = 0;

    /**
     * (0, 0)点，原点
     */
    static Origin: Point2d = new Point2d(0, 0);

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(vector: Vector2d): Point2d {
        return new Point2d(this.x + vector.x, this.y + vector.y);
    }

    subtractPoint(point: Point2d): Vector2d {
        return new Vector2d(this.x - point.x, this.y - point.y);
    }

    subtractVector(vec: Vector2d): Point2d{
        return new Point2d(this.x - vec.x, this.y - vec.y);
    }

    getDistanceTo(point: Point2d): number {
        let deltaX = this.x - point.x;
        let deltaY = this.y - point.y;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    clone():Point2d{
        return new Point2d(this.x, this.y);
    }
}

/**
 * 圆弧
 */
class Arc2d extends Curve2d {
    /**
     * 圆心
     */
    center: Point2d = Point2d.Origin;

    /**
     * 半径
     */
    radius: number = 1;

    /**
     * 起始角
     */
    startAngle: number = 0;

    /**
     * 终止角
     */
    endAngle: number = Math.PI;

    /**
     * 是否顺时针
     */
    clockwise: boolean = false;

    constructor() {
        super();
        this.type = "Arc2d";
    }

}

/**
 * 椭圆
 */
class Ellipse2d extends Curve2d {
    /**
     * 圆心
     */
    center: Point2d = Point2d.Origin;

    /**
     * 长轴向量，其长度为长轴的长度
     */
    majorAxis: Vector2d = Vector2d.XAxis;

    /**
     * 短轴长度/长轴长度
     */
    raiusRatio: number = 1;

    /**
     * 起始角
     */
    startAngle: number = 0;

    /**
     * 终止角
     */
    endAngle: number = Math.PI;

    /**
     * 是否顺时针
     */
    clockwise: boolean = false;

    constructor() {
        super();
        this.type = "Ellipse2d";
    }
}

/**
 * 二维向量
 */
class Vector2d {
    /**
     * X值，单位为m
     */
    x: number = 0;

    /**
     * Y值，单位为m
     */
    y: number = 0;

    /**
     * 单位X向量
     */
    static XAxis: Vector2d = new Vector2d(1, 0);

    /**
     * 单位Y向量
     */
    static YAxis: Vector2d = new Vector2d(0, 1);

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    get length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    rotateBy(angle: number): Vector2d {

        const c = Math.cos(angle), s = Math.sin(angle);

        const x = this.x;
        const y = this.y;

        let new_x = x * c - y * s;
        let new_y = x * s + y * c;

        return new Vector2d(new_x, new_y);
    }

    get normal(): Vector2d {
        let length = this.length;
        if (length < 1e-6) {
            return new Vector2d(0, 0);
        }
        return new Vector2d(this.x / length, this.y / length);
    }

    multiplyScalar(scale: number): Vector2d {
        return new Vector2d(this.x * scale, this.y * scale);
    }

    dot(v: Vector2d): number {
        return this.x * v.x + this.y * v.y;
    }
}

/**
 * 二维多段线
 */
class Polyline2d extends Curve2d {
    /**
     * 节点数组
     */
    points: Point2d[] = [];

    /**
     * 凸度数组。凸度被用来表示一个顶点的弧度大小，它的值是这段弧所包含角度的1/4角度的正切。
     * 如果弧从起点到终点是顺时针走向则凸度为负数，0表示直线，1表示半圆。顺时针时为负。
     * 公式推导见011文档
     */
    bulges: number[] = [];

    /**
     * 是否闭合
     */
    closed: boolean = false;

    constructor() {
        super();
        this.type = "Polyline2d";
    }
}

/**
 * 圆
 */
class Circle2d extends Curve2d {
    /**
     * 圆心
     */
    center: Point2d = Point2d.Origin;

    /**
     * 半径
     */
    radius: number = 1;

    constructor(center = Point2d.Origin, radius = 1) {
        super();
        this.type = "Circle2d";
        this.center = center;
        this.radius = radius;
    }
}

export {
    Polyline2d,
    Point2d,
    Vector2d,
    Model2d,
    Line2d,
}