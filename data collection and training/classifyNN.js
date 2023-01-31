let video;
let pose;
let skeleton;
let poses = ["L", "R", "B", "N"];
let poseLabel;
let poseNet;
let nn;
const DATA_PATH = "data.json";
const NUM_OF_POSES = 5;
const NUM_OF_BODY_POS = 17;

// Loading the data before

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // setup posenet model
  // posenet requires input image/video and a callback function
  poseNet = ml5.poseNet(video, modelLoaded);

  // on() function is called on seeing a pose.
  // the object of bodypoints is given to callback function getPoses
  poseNet.on("pose", getPoses);
  // getPoses initializes pose and skeleton variables

  // Setup neural network
  let options = {
    task: "classification",
    inputs: NUM_OF_BODY_POS * 2, // x2 for x and y coordinates
    outputs: NUM_OF_POSES,
    debug: true,
  };

  nn = ml5.neuralNetwork(options);

  const modelInfo = {
    model: "model.json",
    metadata: "model_meta.json",
    weights: "model.weights.bin",
  };

  // load the saved model
  nn.load(modelInfo, networkLoaded);
}

function networkLoaded() {
  console.log("Data & Neural Network loaded!");
  classifyPose();
}

// call back function
function modelLoaded() {
  console.log("PoseNet model loaded!");
}

function classifyPose() {
  // classify pose
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    nn.classify(inputs, gotResult);
  } else {
    setTimeout(classifyPose, 1000);
  }
}

function gotResult(error, results) {
  if (results[0].confidence > 0.7) {
    poseLabel = results[0].label;
    /*
    // if (results[0].label == "Pose0") {
    //   poseLabel = "Pose0";
    // } else if (results[0].label == "Pose1") {
    //   poseLabel = "Pose1";
    // } else if (results[0].label == "Pose2") {
    //   poseLabel = "Pose2";
    // } else {
    //   poseLabel = "Incorrect pose";
    // }
    */
  }
  else{
    poseLabel = "Incorrect pose";
  }
  classifyPose();
}

function getPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
    //   console.log(pose);
    //   console.log(skeleton);
  }
}

function draw() {
  const flippedVideo = ml5.flipImage(video);
  image(flippedVideo, 0, 0, width, height);

  // draw skeleton
  if (pose) {
    push();
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(8);
      stroke(244, 194, 194);
      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
    pop();
    fill(255, 0, 255);
    textSize(90)
    noStroke();
    
    if (poseLabel == "Incorrect pose") {
      fill(255, 0, 0);
    } else {
      fill(0, 255, 0);
    }
    textAlign(CENTER, TOP);
    text(poseLabel, width / 2, height / 2);
  }
}
