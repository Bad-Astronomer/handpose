const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");

const size = {
    height: video.getAttribute("height"),
    width:  video.getAttribute("width")
}

canvas.width = size.width;
canvas.height = size.height;

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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
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