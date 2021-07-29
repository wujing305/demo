import { Geometry } from './Geometry';
import { ShapeGeometry } from 'three';

class ShapeGeometryEx extends Geometry {

	parameters:any;

	constructor( shapes, curveSegments? ) {

		super();
		this.type = 'ShapeGeometryEx';

		if ( typeof curveSegments === 'object' ) {

			console.warn( 'THREE.ShapeGeometryEx: Options parameter has been removed.' );

			curveSegments = curveSegments.curveSegments;

		}

		this.parameters = {
			shapes: shapes,
			curveSegments: curveSegments
		};

		this.fromBufferGeometry( new ShapeGeometry( shapes, curveSegments ) );
		this.mergeVertices();

	}

	toJSON() {

		const data = Geometry.prototype.toJSON.call( this );

		const shapes = this.parameters.shapes;

		return toJSON( shapes, data );

	}

}

function toJSON( shapes, data ) {

	data.shapes = [];

	if ( Array.isArray( shapes ) ) {

		for ( let i = 0, l = shapes.length; i < l; i ++ ) {

			const shape = shapes[ i ];

			data.shapes.push( shape.uuid );

		}

	} else {

		data.shapes.push( shapes.uuid );

	}

	return data;

}

export { ShapeGeometryEx };
