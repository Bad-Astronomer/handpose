import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let object;

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

window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

let mouse_down = function(e) {
    cameraControls.enabled = false;
}

let mouse_up = function(e) {
    cameraControls.enabled = true;
}


//bones lists: (contains index)
const DONT_USE = [6, 10, 14, 18]
const ROOT = 0
const WRIST = 1
const THUMB = [2,5] //! removed 3
const INDEX = [7, 8, 9]
const MIDDLE = [11, 12, 13]
const RING = [15,16,17]
const LITTLE = [19,20,21]

const BONES =  [7, 8, 9, 11, 12, 13, 15, 16, 17, 19, 20, 21]


const clock = new THREE.Clock();
const rotationSpeed = 1 
let time;
let rotationAngle;
const minAngle = -Math.PI / 4;
const maxAngle = Math.PI / 4; 
function animate() {
    requestAnimationFrame(animate);
    if(camera) {
        // renderer.render(scene, camera);
        if(selectedBone) {

            selectedBone.rotation.x = Math.PI/180 * 60;
            renderer.render(scene, camera);
        }
    }
}


const loader = new GLTFLoader();
let skinnedMesh;
let selectedBone;
loader.load(
    `models/handyhand.glb`,
    function (glb) {
        scene.add(glb.scene)
        
        skinnedMesh = glb.scene.children[0].children[0]
        const bones = skinnedMesh.skeleton.bones
        selectedBone = bones[17];
        let i = 0
        setInterval(() => {
            selectedBone = bones[BONES[i]];
            i = (i+1)%BONES.length
        }, 100)
        // selectedBone = bones[5]

        console.log(selectedBone);
        bones[2].rotation.x = Math.PI/180 * 0;
        bones[2].rotation.z = Math.PI/180 * (-45);

        // bones[0].rotation.z = Math.PI/180 * 90;

        animate();
    },
    function (xhr) {
        console.log('loaded');
    },
    function (error) {
        console.error(error);
    }
);