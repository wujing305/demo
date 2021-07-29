import {Line3d, Point3d} from "./geometry"
import {Line2d, Point2d} from "../model2d/model2d"

class Convert
{
    static toLine2d(line3d:Line3d):Line2d{
        return new Line2d(Convert.toPoint2d(line3d.StartPoint), Convert.toPoint2d(line3d.EndPoint));
    }

    static toPoint2d(pt3d:Point3d):Point2d{
        return new Point2d(pt3d.x, pt3d.y);
    }
}

export {
    Convert
}