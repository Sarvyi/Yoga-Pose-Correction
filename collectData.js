let video;
let pose;
let skeleton;
// let pose_names = ["MOUNTAIN", "GODDESS", "GARLAND", "PLANK", "COBRA"];
let pose_names = ["COBRA"];
// let poses = [];
let targetPose;
let poseNet;
let knn;
let collectingData = false;

// const NUM_OF_POSES = 5;
// const NUM_OF_BODY_POS = 17;

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

  // // Setup neural network
  // nn = ml5.neuralNetwork({
  //   inputs: NUM_OF_BODY_POS * 2, // x2 for x and y coordinates
  //   outputs: NUM_OF_POSES,
  //   debug: true,
  // });

  knn = ml5.KNNClassifier();
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
    // let keypoints = pose.keypoints;
    if (collectingData) {
    // let input = [];
      const poseArray = pose.keypoints.map(p => [p.score, p.position.x, p.position.y]);
      knn.addExample(poseArray, targetPose); 
    }
        // let score = keypoints.score
        // input.push(x);
        // input.push(y);
        // input.push(score);
      // after exiting the for loop we have our input ready
      // and the targetPose is already initialized in keyPressed
      // add this to neural network
      //           x        y
      // knn.addExample(input, [targetPose]); // y of neural network has to be in an array
      // console.log(input.slice(0, 4),'...', targetPose);
    // }
  }
}


function keyPressed() {
  // save data
  // console.log(key);
  if (key == "s") {
    knn.save("data.json");
  }

  // set target pose and collecting state
  else {
    if(parseInt(key)>=0 && parseInt(key)<4)
    {
      targetPose = pose_names[parseInt(key)];
      setTimeout(() => {
        collectingData = true;
        console.log("collecting = ", collectingData);
        console.log(targetPose)
        setTimeout(() => {
          collectingData = false;
          console.log("collecting = ", collectingData);
        }, 10000); // reset collectingData after 10 seconds

        /* During the interval of 5 seconds 
                  - key points will be captured
                  - converted to array of size 34 (x and y of 17 points)
                  - add the array and target to neural network */
      }, 10000); // wait for 10 sec then set collectingData
    }
  }
}

function drawKeypoints() {
  if(pose)
  {
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    } 
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
    // let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
  if(pose) 
  {
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}

function draw() {
  image(video, 0, 0, width, height);

  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  drawSkeleton();

  fill(0,255,0);
  textSize(64);
}
// // A function to draw the skeletons
// function draw() {
//   // Loop through all the skeletons detected
//   for (let i = 0; i < skeleton.length && i < 1; i++) {
//     // let skeleton = poses[i].skeleton;
//     // For every skeleton, loop through all body connections
//     for (let j = 0; j < skeleton.length; j++) {
//       let partA = skeleton[j][0];
//       let partB = skeleton[j][1];
//       stroke(255, 0, 0);
//       line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
//     }
//   }
// }