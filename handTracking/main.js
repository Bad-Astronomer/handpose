import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'stats.js';

//* Viewport
const viewport = document.getElementById("viewport")
const scene = new THREE.Scene();

//* Camera
const camera = new THREE.PerspectiveCamera(75, 640 / 480, 0.1, 1000);
camera.position.z = 2;

//* Renderer
const renderer = new THREE.WebGLRenderer({ canvas: viewport, antialias: true });
renderer.setSize(640, 480);

//* Axis
const axesHelper = new THREE.AxesHelper( 2.5 );
scene.add( axesHelper );

//* Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 1.5;
controls.maxDistance = 2;

//* Stats
const viewportStats = new Stats()
viewportStats.showPanel(0)
document.getElementById("viewport-container").appendChild(viewportStats.dom)
viewportStats.dom.style.position = "absolute";

//* Landmark spheres (Keypoints 3D)
let landmarks = [];
let keypoints3D = [];

let color = "aqua";
for(let i = 0; i < 21; i++){
  let sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 16, 16),
    new THREE.MeshBasicMaterial({ color: color })
  );

  scene.add(sphere);
  landmarks.push(sphere)
}

//* Skeleton 2D
const connections = [
  [0, 1], [1, 2], [2, 3], [3, 4],   // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],   // Index finger
  [0, 9], [9, 10], [10, 11], [11, 12],   // Middle finger
  [0, 13], [13, 14], [14, 15], [15, 16],   // Ring finger
  [0, 17], [17, 18], [18, 19], [19, 20]   // Little finger
];

//* Skeleton 3D
const landmark_connections = []
connections.forEach((connection, index) => {
  let line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([landmarks[connection[0]].position, landmarks[connection[1]].position]),
    new THREE.LineBasicMaterial({ color: 0xffffff })
  );
  scene.add(line);
  landmark_connections.push(line);
})


//* 2D video overlay
const video = document.getElementById("video");
const overlay = document.getElementById("overlay");
const ctx = overlay.getContext("2d");

const size = {
    height: video.getAttribute("height"),
    width:  video.getAttribute("width")
}

overlay.width = size.width;
overlay.height = size.height;


//* hand-pose-detection model
const model = handPoseDetection.SupportedModels.MediaPipeHands;
const detectorConfig = {
    runtime: 'mediapipe', // or 'tfjs',
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
    modelType: 'full'
}
const detector = await handPoseDetection.createDetector(model, detectorConfig);

navigator.mediaDevices.getUserMedia({video: true})
    .then((stream) => {
        video.srcObject = stream;
        video.play();
    }
);

video.onloadeddata = function() {
    async function predict() {
        const estimationConfig = {flipHorizontal: true};
        const predictions = await detector.estimateHands(video, estimationConfig);

        ctx.clearRect(0, 0, overlay.width, overlay.height);
        
        if (predictions.length){
            predictions.forEach((hand) => {
                //* Color
                hand.handedness == "Left" ? color = "red" : color = "aqua";
                
                //* Joints / Keypoints          
                let keypoints = hand.keypoints;
                keypoints3D = hand.keypoints3D;

                keypoints3D.forEach((keypoint, index) => {
                  // 3D
                  let {x, y, z} = keypoint;
                  landmarks[index].position.copy(new THREE.Vector3(x*10, y*-10, z*-10));
                  landmarks[index].material.color.set(color);

                  // 2D
                  ({x, y} = keypoints[index])
                  ctx.beginPath();
                  ctx.arc(x , y, 5, 0, 2 * Math.PI);
                  ctx.fillStyle = color;
                  ctx.fill();
                })

                //* Skeleton lines
                connections.forEach((connection, index) => {
                  // 3D
                  landmark_connections[index].geometry.setFromPoints([landmarks[connection[0]].position, landmarks[connection[1]].position]);

                  // 2D
                  ctx.beginPath();
                  ctx.moveTo(keypoints[connection[0]].x, keypoints[connection[0]].y);
                  ctx.lineTo(keypoints[connection[1]].x, keypoints[connection[1]].y);
                  ctx.strokeStyle = 'white';
                  ctx.lineWidth = 2;
                  ctx.stroke();
                });
            })
        }
        renderer.render(scene, camera);

        viewportStats.update();
        requestAnimationFrame(predict);
    }

    predict();
}