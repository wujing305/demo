import * as THREE from "three";
import { OrbitControls } from "./OrbitControls";

let camera, scene, renderer;

let uniforms;

let vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;

    void main()	{

        vUv = uv;
        vPosition = position;

        //gl_Position = vec4( position, 1.0 );
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
    // attribute vec4 aVertexPosition;
    // uniform mat4 uModelViewMatrix;
    // uniform mat4 uProjectionMatrix;
    // void main() {
    //   gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    // }
`;
let fragmentShader = `
    varying vec2 vUv;
    varying vec3 vPosition;

    uniform float time;

    void main()	{

        // vec2 p = - 1.0 + 2.0 * vUv;
        // float a = time * 40.0;
        // float d, e, f, g = 1.0 / 40.0 ,h ,i ,r ,q;

        // e = 400.0 * ( p.x * 0.5 + 0.5 );
        // f = 400.0 * ( p.y * 0.5 + 0.5 );
        // i = 200.0 + sin( e * g + a / 150.0 ) * 20.0;
        // d = 200.0 + cos( f * g / 2.0 ) * 18.0 + cos( e * g ) * 7.0;
        // r = sqrt( pow( abs( i - e ), 2.0 ) + pow( abs( d - f ), 2.0 ) );
        // q = f / r;
        // e = ( r * cos( q ) ) - a / 2.0;
        // f = ( r * sin( q ) ) - a / 2.0;
        // d = sin( e * g ) * 176.0 + sin( e * g ) * 164.0 + r;
        // h = ( ( f + d ) + a / 2.0 ) * g;
        // i = cos( h + r * p.x / 1.3 ) * ( e + e + a ) + cos( q * g * 6.0 ) * ( r + h / 3.0 );
        // h = sin( f * g ) * 144.0 - sin( e * g ) * 212.0 * p.x;
        // h = ( h + ( f - e ) * q + sin( r - ( a + h ) / 7.0 ) * 10.0 + i / 4.0 ) * g;
        // i += cos( h * 2.3 * sin( a / 350.0 - q ) ) * 184.0 * sin( q - ( r * 4.3 + a / 12.0 ) * g ) + tan( r * g + h ) * 184.0 * cos( r * g + h );
        // i = mod( i / 5.6, 256.0 ) / 64.0;
        // if ( i < 0.0 ) i += 4.0;
        // if ( i >= 2.0 ) i = 4.0 - i;
        // d = r / 350.0;
        // d += sin( d * d * 8.0 ) * 0.52;
        // f = ( sin( a * g ) + 1.0 ) / 2.0;
        // gl_FragColor = vec4( vec3( f * i / 1.6, i / 2.0 + d / 13.0, i ) * d * p.x + vec3( i / 1.3 + d / 8.0, i / 2.0 + d / 18.0, i ) * d * ( 1.0 - p.x ), 1.0 );
        
        float x = vPosition.x;
        gl_FragColor = vec4(1.0, 0, 0, 1.0);
        if(vPosition.x > 0.0){
            gl_FragColor = vec4(1.0, 0, 0, 1.0);
        }
        else{
            gl_FragColor = vec4(0, 1.0, 0, 1.0);
        }
    }
`;

    function init() {

        const container = document.getElementById( 'container' );
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setClearColor(0xaaaaaa);
        container.appendChild( renderer.domElement );
        renderer.domElement.style.position = "absolute";
        renderer.domElement.style.top = "0px";
        renderer.domElement.style.left = "0px";
    
//        camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1000 );
        camera = new THREE.PerspectiveCamera(
            40,
            window.innerWidth / window.innerHeight,
            0.01,
            1000
          );
        camera.position.x = 10;
        camera.position.y = 20;
        camera.position.z = 30;
        camera.lookAt(10, 0, -10);
            
        scene = new THREE.Scene();
        scene.clear();

        const helper = new THREE.GridHelper(100, 100);
        scene.add(helper);
    

        const geometry = new THREE.BoxGeometry( 1, 0.5, 0.5 );

        uniforms = {
            time: { value: 1.0 }
        };

        const material = new THREE.ShaderMaterial( {

            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader

        } );

        {
            const mesh = new THREE.Mesh( geometry, material );
            scene.add( mesh );
        }
        // {
        //     const mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color: 0x00ff00}));
        //     scene.add( mesh );
        // }


        // scene.add(new THREE.AmbientLight(0xffffff, 1));
        // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        // directionalLight.position.x = 0;
        // directionalLight.position.y = 0;
        // directionalLight.position.z = 10;
        // scene.add(directionalLight);
        // scene.add(directionalLight.target);
    
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.addEventListener("change", render); // use if there is no animation loop
        controls.enablePan = true;
        controls.enableZoom = true;
        controls.enableRotate = true;

        onWindowResize();

        window.addEventListener( 'resize', onWindowResize );

        render();

    }

    function onWindowResize() {

        renderer.setSize( window.innerWidth, window.innerHeight );
        render();

    }

    //

    // function animate() {

    //     requestAnimationFrame( animate );

    //     uniforms[ 'time' ].value = performance.now() / 1000;

    //     renderer.render( scene, camera );

    // }

    function render(){
        console.log("render")
        renderer.render( scene, camera );
    }

export {init}