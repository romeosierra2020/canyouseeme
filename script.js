const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const intro = document.getElementById("intro");
const ctx = canvas.getContext("2d");
const constraints = {
    video: {},
};
let canv;
let options;
speechSynthesis.cancel();
const startWebCam = async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri("./face-api.js/weights");
    await faceapi.nets.faceLandmark68Net.loadFromUri("./face-api.js/weights");
    options = new faceapi.TinyFaceDetectorOptions();
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        await video.play();
        let stream_settings = stream.getVideoTracks()[0].getSettings();
        canvas.width = stream_settings.width;
        canvas.height = stream_settings.height;
        const detections = await faceapi.detectSingleFace(video, options);
        intro.innerHTML = "";
    } catch (err) {
        console.log(err);
    }
};

window.addEventListener("click", detect);
window.addEventListener("keydown", detect);

startWebCam();
function drawTarget(centreX, centreY, radius) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(centreX, centreY, radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.strokeStyle = "blue";
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centreX - 20, centreY);
    ctx.lineTo(centreX + 20, centreY);
    ctx.moveTo(centreX, centreY - 20);
    ctx.lineTo(centreX, centreY + 20);
    ctx.closePath();
    ctx.stroke();
}
async function detect(e) {
    e.preventDefault();
    speechSynthesis.cancel();
    const detections = await faceapi.detectSingleFace(video, options);
    if (!detections) {
        let utterance = new SpeechSynthesisUtterance(
            "No face found. Please check webcam position and lighting."
        );
        speechSynthesis.speak(utterance);
    } else {
        let faceCentreX = detections._box._x + detections._box._width / 2;
        let faceCentreY = detections._box._y + detections._box._height / 2;
        let radius = detections._box._height / 2;
        drawTarget(faceCentreX, faceCentreY, radius);
        let centreScreenX = canvas.width / 2;
        let centreScreenY = canvas.height / 2;
        let message = "";
        if (centreScreenX - faceCentreX > canvas.width / 8) {
            message += "Horizontal to the left.";
        } else if (centreScreenX - faceCentreX < -canvas.width / 8) {
            message += "Horizonta to the right.";
        } else {
            message += "Horizontal centre.";
        }
        if (centreScreenY - faceCentreY > canvas.height / 8) {
            message += " Vertical to the top";
        } else if (centreScreenY - faceCentreY < -canvas.width / 8) {
            message += " Vertical to the bottom";
        } else {
            message += " Vertical Centre";
        }
        let utterance = new SpeechSynthesisUtterance(message);
        speechSynthesis.speak(utterance);
    }
}
