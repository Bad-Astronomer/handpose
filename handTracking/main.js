var video = document.getElementById("video");
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

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(function (stream) {
      video.srcObject = stream;
      video.play();
    })
    .catch(function (err) {
      console.log("An error occurred: " + err);
    });
}

handpose.load().then(function (model) {
  async function detectHands() {
    const predictions = await model.estimateHands(video);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (predictions.length > 0) {
      // console.log(predictions[0].handInViewConfidence);

      //* Assuming only one hand
      const keypoints = predictions[0].landmarks;

      //* Joints / Keypoints
      for (let j = 0; j < keypoints.length; j++) {
        const [x, y] = keypoints[j];
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "aqua";
        ctx.fill();
      }

      //* Skeleton lines
      connections.forEach(([startIdx, endIdx]) => {
        ctx.beginPath();
        ctx.moveTo(keypoints[startIdx][0], keypoints[startIdx][1]);
        ctx.lineTo(keypoints[endIdx][0], keypoints[endIdx][1]);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    requestAnimationFrame(detectHands);
  }

  detectHands();
});
