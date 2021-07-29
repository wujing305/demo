import { Point3d, Vector3d } from "./geometry"

abstract class Entity {
    /// 类型名称
    public typename: string = ""
    /// 实体ID
    public entityID: number = 0
}



class Model3d {
    /// <summary>
    /// 实体数组
    /// </summary>
    public entities: Entity[] = []

    /// <summary>
    /// 材料字典
    /// </summary>
    //public Dictionary<string, Material> materials = new Dictionary<string, Material>();
    public materials: Map<string, Material> = new Map<string, Material>()

    /// <summary>
    /// 节点字典
    /// </summary>
    //public Dictionary<string, Vertex> vertices = new Dictionary<string, Vertex>();
    public vertices: Map<string, Vertex> = new Map<string, Vertex>()

    /// <summary>
    /// 组件（群组）字典
    /// </summary>
    //public Dictionary<string, ComponentDefinition> componentDefinitions = new Dictionary<string, ComponentDefinition>();
    public componentDefinitions: Map<string, ComponentDefinition> = new Map<string, ComponentDefinition>()

    /// <summary>
    /// 面数组
    /// </summary>
//    public faces: Face[] = []

    /// <summary>
    /// 边数组
    /// </summary>
//    public edges: Edge[] = []
}



class Material extends Entity {
    constructor() {
        super()
        this.typename = "Material"
        
    }

    public name: string = ""
    public alpha: number = 0
    public color: number = 0
    public materialType: number = 0
    public texture: Texture = null
}


class Texture extends Entity {
    constructor() {
        super()
        this.typename = "Texture";
    }
    public filename: string = ""
    public width: number = 0
    public height: number = 0
    public image_width: number = 0
    public image_height: number = 0
}


class Vertex {
    public position: Point3d = Point3d.Origin

    /// <summary>
    /// 实体ID
    /// </summary>
    public entityID: number = 0
}


abstract class Drawingelement extends Entity {
    public materialID: number = 0
}

class ComponentDefinition extends Drawingelement {
    public entities: Entity[] = []

    public name: string = ""
    constructor() {
        super();
        this.typename = "ComponentDefinition";
    }
}


class Loop {
    public vertices: number[] = []

    public outer: boolean = true
}


class Face extends Drawingelement {
    constructor() {
        super();
        this.typename = "Face";
    }

    public loops: Loop[] = []

    public back_material_ID = 0

    //public List<Point3d> uvs = new List<Point3d>();

    //public List<Point3d> back_uvs = new List<Point3d>();

    public uvs: any = null


}



class Edge extends Drawingelement {
    constructor() {
        super();
        this.typename = "Edge";
    }
    public vertices: number[] = []

    public smooth = false

    public soft = false

}


class ComponentInstance extends Drawingelement {
    public constructor() {
        super();
        this.typename = "ComponentInstance";
    }
    /// <summary>
    /// 组件定义ID
    /// </summary>
    public definition: number = 0

    public name = ""

    public transformation: Transformation = null

}



class Transformation {
    public array: number[] = null
}

class Group extends Drawingelement {
    public constructor() {
        super();
        this.typename = "Group"
    }
    /// <summary>
    /// 组件定义ID
    /// </summary>
    public definition = 0

    public name = ""

    public transformation: Transformation = null

    public description = ""

}


export {
    Entity,
    Model3d,
    Material,
    Texture,
    Vertex,
    Drawingelement,
    ComponentDefinition,
    Loop,
    Face,
    Edge,
    ComponentInstance,
    Transformation,
    Group
}