import { Model3d } from "./model3d";
import {Model2d} from "../model2d/model2d"
import { Curve3d, Point3d } from "./geometry";

/**
 * 定位信息，这是抽象类，会派生出定位点和定位曲线。
 */
abstract class Location
{
    /**
     * 类型字符串
     */
    public type:string  = "Location";
}

/**
 * 图元, 这是抽象类
 */
abstract class Element
{
    public model3D:Model3d = null;

    public plan:Model2d = null;

    public location:Location = null;

    public id:number = 0;

    public name:string = "";

    public type:string = "";
}

/**
 * 定位点，用于点定位的图元，可以确定图元的位置点和绕Z轴的旋转角
 */
class LocationPoint extends Location
{
    public Point:Point3d = Point3d.Origin;
    public Rotation:number = 0;

    public constructor()
    {
        super();
        this.type = "LocationPoint";
    }
}

/**
 * 墙连接类型
 */
enum JoinType
{
    /**
     * 默认连接
     */
    None = -1,
    /**
     * 平接
     */
    Abut = 0,
    /**
     * 斜接（暂不支持）
     */
    Miter = 1,
    /**
     * 方接（暂不支持）
     */
    SquareOff = 2,
    /**
     * 扩展（暂不支持）
     */
    Extension = 3
}

class LocationCurve extends Location
{
    public Curve:Curve3d = null;
    public ElementsAtJoins:number[][]  = [];
    public JoinTypes:JoinType[]  = [];
    public constructor()
    {
        super();
        this.type = "LocationCurve";
    }
}

abstract class HostObject extends Element
{
    public insertElementIds:number[]  = [];

    public constructor()
    {
        super();
        this.type = "HostObject";
    }
}

class Wall extends HostObject
{
    public width:number = 0;
    public height:number = 0;
    public wallKeyRefParam:number = 0;
    public wallJoinAllowedAtEnd:boolean[]  = [];

    public constructor()
    {
        super();
        this.type = "Wall";
    }
}

export{
    Wall,
    LocationCurve
}
