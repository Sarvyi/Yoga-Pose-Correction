let video;
let pose;
let skeleton;
let poses = ["L", "R", "B", "N"];
let targetPose;
let poseNet;
let nn;
let collectingData = false;

const NUM_OF_POSES = 5;
const NUM_OF_BODY_POS = 17;

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
  nn = ml5.neuralNetwork({
    inputs: NUM_OF_BODY_POS * 2, // x2 for x and y coordinates
    outputs: NUM_OF_POSES,
    debug: true,
  });
}

// call back function
function modelLoaded() {
  console.log("PoseNet model loaded!");
}

function getPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
    //   console.log(pose);
    //   console.log(skeleton);

    // make data
    let keypoints = pose.keypoints;
    if (collectingData) {
      let input = [];
      for (let i = 0; i < keypoints.length; i++) {
        // let partname = keypoints.part
        let x = keypoints[i].position.x;
        let y = keypoints[i].position.y;

        // let score = keypoints.score
        input.push(x);
        input.push(y);
      }
      // after exiting the for loop we have our input ready
      // and the targetPose is already initialized in keyPressed
      // add this to neural network
      //           x        y
      nn.addData(input, [targetPose]); // y of neural network has to be in an array
      // console.log(input.slice(0, 4),'...', targetPose);
    }
  }
}

function keyPressed() {
  // save data
  if (key == "s") {
    nn.saveData();
  }

  // set target pose and collecting state
  else {
    targetPose = poses[parseInt(key)];
    setTimeout(() => {
      collectingData = true;
      console.log("collecting = ", collectingData);
      setTimeout(() => {
        collectingData = false;
        console.log("collecting = ", collectingData);
      }, 5000); // reset collectingData after 5 seconds

      /* During the interval of 5 seconds 
                - key points will be captured
                - converted to array of size 34 (x and y of 17 points)
                - add the array and target to neural network */
    }, 10000); // wait for 10 sec then set collectingData
  }
}

function draw() {
  const flippedVideo = ml5.flipImage(video);
  image(flippedVideo, 0, 0, width, height);

  // draw skeleton
  if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(8);
      stroke(244, 194, 194);
      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
  }
}
