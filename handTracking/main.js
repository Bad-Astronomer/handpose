const video = document.getElementById("video");
const overlay = document.getElementById("overlay");
const ctx = overlay.getContext("2d");

const size = {
    height: video.getAttribute("height"),
    width:  video.getAttribute("width")
}

overlay.width = size.width;
overlay.height = size.height;

const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4],   // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8],   // Index finger
    [0, 9], [9, 10], [10, 11], [11, 12],   // Middle finger
    [0, 13], [13, 14], [14, 15], [15, 16],   // Ring finger
    [0, 17], [17, 18], [18, 19], [19, 20]   // Little finger
];



const model = handPoseDetection.SupportedModels.MediaPipeHands;
const detectorConfig = {
    runtime: 'mediapipe', // or 'tfjs',
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
    modelType: 'full'
}

const detector = await handPoseDetection.createDetector(model, detectorConfig);

let color = "aqua";


navigator.mediaDevices.getUserMedia({video: true})
    .then((stream) => {
        video.srcObject = stream;
        video.play();
    }
);


video.onloadeddata = function() {
    async function predict() {
        // const predictions = await model.estimateHands(video, true); // true: flipHorizontal
        const estimationConfig = {flipHorizontal: true};
        const predictions = await detector.estimateHands(video, estimationConfig);
        ctx.clearRect(0, 0, overlay.width, overlay.height);
        
        if (predictions.length){
            predictions.forEach((hand) => {

                if(hand.handedness == "Left"){
                    color = "red";
                }
                else{
                    color = "aqua";
                }

                
                let keypoints = hand.keypoints;
                console.log(keypoints)

                //* Joints / Keypoints
                for (let j = 0; j < keypoints.length; j++) {
                    const {x, y} = keypoints[j];
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, 2 * Math.PI);
                    ctx.fillStyle = color;
                    ctx.fill();
                }

                //* Skeleton lines
                connections.forEach(([startIdx, endIdx]) => {
                    ctx.beginPath();
                    ctx.moveTo(keypoints[startIdx].x, keypoints[startIdx].y);
                    ctx.lineTo(keypoints[endIdx].x, keypoints[endIdx].y);
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                });

            })
        }

        requestAnimationFrame(predict);
    }

    predict();
}

import * as THREE from 'three';

const viewport = document.getElementById("viewport")

let scene = new THREE.Scene();

let camera = new THREE.PerspectiveCamera(75, 640 / 480, 0.1, 1000);
camera.position.z = 5;

let renderer = new THREE.WebGLRenderer({ canvas: viewport, antialias: true });
renderer.setSize(640, 480);

let geometry = new THREE.BoxGeometry(1, 1, 1);
let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

let cube = new THREE.Mesh(geometry, material);

scene.add(cube);

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();