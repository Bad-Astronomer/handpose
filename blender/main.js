import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let object;

const loader = new GLTFLoader();
loader.load(
    `models/handyhand.glb`,
    function (glb) {
        object = glb.scene;
        scene.add(object);

        // VIDEO CODE STARTS HERE
        // TIME STAMP 22:00
        let positions_list = [];
        glb.scene.traverse(function(child){
            if(child.userData.prop){
                const transform = new TransformControls(camera, renderer.domElement);
                transform.mode = "rotate";
                transform.space = "local";
                
                transform.size = 0.3
                transform.rotationSnap = Math.PI/10;

                transform.showY = false;
                transform.showZ = false;
                
                // TIMESTAMP 26:00


            }
        })
        // VIDEO CODE ENDS HERE
    },
    function (xhr) {
        console.log('loaded');
    },
    function (error) {
        console.error(error);
    }
);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container3D").appendChild(renderer.domElement);

camera.position.z = 3;
camera.position.x = 3;
camera.position.y = 3;

const topLight = new THREE.DirectionalLight(0xffffff, 2);
topLight.position.set(500, 500, 500);
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 5);
scene.add(ambientLight);

const axesHelper = new THREE.AxesHelper( 2.5 );
scene.add( axesHelper );

const gridHelper = new THREE.GridHelper( 5, 16 );
scene.add( gridHelper );

const cameraControls = new OrbitControls(camera, renderer.domElement);
cameraControls.minDistance = 1;
cameraControls.maxDistance = 5;

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();