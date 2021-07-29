//c# 里为 struct
class Point3d {
    constructor(X: number, Y: number, Z: number) {
        this.x = X;
        this.y = Y;
        this.z = Z;
    }
    public x: number
    public y: number
    public z: number
    
    public static get Origin(): Point3d {
        return new Point3d(0, 0, 0);
    }

    add(vector:Vector3d):Point3d{
        return new Point3d(this.x + vector.x, this.y + vector.y, this.z + vector.z);
    }

    subtract(point:Point3d):Vector3d{
        return new Vector3d(this.x - point.x, this.y - point.y, this.z - point.z);
    }
}

//C#里是struct
class Vector3d {
    public x: number;
    public y: number;
    public z: number;

    constructor(x: number, y: number, z: number) {
        this.z = z;
        this.x = x;
        this.y = y;
    }

    public static get XAxis(): Vector3d {
        return new Vector3d(1, 0, 0);
    }

    public static get YAxis(): Vector3d {
        return new Vector3d(0, 1, 0);
    }

    public static get ZAxis(): Vector3d {
        return new Vector3d(0, 0, 1);
    }

    get length():number{
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
}

abstract class Curve3d
{
    public type:string  = "Curve3d";
}

class Line3d extends Curve3d
{
    public StartPoint:Point3d  = Point3d.Origin;
    public EndPoint:Point3d  = new Point3d(1, 1, 1);

    public constructor()
    {
        super();
        this.type = "Line3d";
    }
}

class Arc3d extends Curve3d
{
    public center:Point3d = Point3d.Origin;
    public normal:Vector3d = Vector3d.ZAxis;
    public radius:number = 1;
    public startAngle:number = 0;
    public endAngle:number = Math.PI;
    public constructor()
    {
        super();
        this.type = "Arc3d";
    }
}

export {
    Point3d,
    Vector3d,
    Curve3d,
    Line3d
}
