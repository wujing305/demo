import { Point3d } from "./geometry";

class BoundingBox
{
    min:Point3d = null;
    max:Point3d = null;
}

class LodGeometryInfo
{
    /**
     * 是否简化模型
     */
    isSimplified:boolean = false;

    level:number=0;

    /**
     * 顶点数
     */
    verticesCount:number = 0;

    /**
     * 三角面数
     */
    facesCount:number = 0;

    /**
     * 顶点密度，即单位表面积内的顶点数量
     */
    verticesDensity:number = 0;

    /**
     * 文件名称
     */
    fileName:string;

    /**
     * 计算顶点密度
     */
    compute(area:number){
        if(area < 1e-6)
        {
            return 1e10;
        }
        this.verticesDensity = this.verticesCount / area;
    }
}

class GeometryInfo
{
    /**
     * 包围盒
     */
    boundingBox:BoundingBox = null;

    /**
     * 完整的模型顶点数据
     */
    fullVerticesCount:number

    /**
     * 各级简化模型的信息
     */
    lodGeometryInfoList:LodGeometryInfo[] = [];

    compute(){
        let area = this.getBoudingBoxArea();
        this.lodGeometryInfoList.forEach(lodGeomInfo => {
            lodGeomInfo.compute(area);
        });
    }

    /**
     * 取包围盒的表面积(6个面)
     */
    getBoudingBoxArea():number
    {
        if(this.boundingBox == null){
            return 0;
        }

        let width = this.boundingBox.max.x - this.boundingBox.min.x;
        let height = this.boundingBox.max.y - this.boundingBox.min.y;
        let depth = this.boundingBox.max.z - this.boundingBox.min.z;
        let area = (width * height + width * depth + height * depth)*2;
        return area;
    }

}

export {BoundingBox, GeometryInfo, LodGeometryInfo}