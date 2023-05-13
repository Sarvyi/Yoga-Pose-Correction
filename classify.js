let video;
let pose;
let skeleton;
let pose_names = ["MOUNTAIN", "GODDESS", "GARLAND", "PLANK"];
let pose_images = {"MOUNTAIN" :"image1.png", "GODDESS": "image2.jpeg", "GARLAND": "image3.jpg", "PLANK": "image4.jpg"};
// let pose_names = ["START"];
let posesDropdown;
let selected_pose;
let poseLabel;
let poseNet;
let knn;

let count = {correct: 0, total: 0}; // [incorrect, got result called]
const DATA_PATH = "./data.json";

// let knee, hip, ankle, kneeFlexion, dorsiflexion, hipFlexion, shoulder, anKnee, sHip, trunkLean;

// Loading the data before

function setup() {
  let cv = createCanvas(640, 500); 
  cv.parent("imager");
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // create options of poses in dropdown
  posesDropdown = document.getElementById("poses_dropdown");

  // pose_names.forEach((name) => { 
    
  //   posesDropdown.options[posesDropdown.options.length] = new Option(
  //     name,
  //     name
  //   );
  // });
  // setup posenet model
  // posenet requires input image/video and a callback function
  poseNet = ml5.poseNet(video, modelLoaded);

  // on() function is called on seeing a pose.
  // the object of bodypoints is given to callback function getPoses
  poseNet.on("pose", getPoses);
  // getPoses initializes pose and skeleton variables

  knn = ml5.KNNClassifier();

  // load the saved model
}

function image_maker(){
  let posesDropdownVal = document.getElementById("poses_dropdown").value;
  // console.log(typeof(posesDropdownVal))
  img_path = pose_images[posesDropdownVal];
  // console.log(pose_val)
  document.getElementById("pose_img").src=img_path;
}

function networkLoaded() {
  console.log("KNN loaded!");
  classifyPose();
}

// call back function
function modelLoaded() {
  console.log("PoseNet model loaded!");
  knn.load(DATA_PATH, networkLoaded);
}

function classifyPose() {

  // classify pose
  if (pose) {
    const poseArray = pose.keypoints.map((p) => [
      p.score,
      p.position.x,
      p.position.y,
    ]);
    setInterval(() => {
      knn.classify(poseArray, gotResult);
    }, 3000);

  } else {
    setTimeout(classifyPose, 1000);
  }
}

function gotResult(error, results) {
  
  if (results) {
    // console.log(results);

    count.total++;

    poseLabel = pose_names[parseInt(results.label)];

    if (posesDropdown.value == poseLabel){
      count.correct++;
    }
    classifyPose();
  }
}

function getPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}


function drawKeypoints() {
  if (pose) {
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
  if (pose) {
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(
        partA.position.x,
        partA.position.y,
        partB.position.x,
        partB.position.y
      );
    }
  }
}

function draw() {
  if (selected_pose != "none") {
    image(video, 0, 0, width, height);

    // We can call both functions to draw all keypoints and the skeletons
    drawKeypoints();
    drawSkeleton();

    fill(0, 255, 0);
    textSize(30);
    //text(classificationResult, width/2, height/2);
    if (posesDropdown.value != poseLabel) 
    {
      text("INCORRECT POSE", width / 4, height - 10);
    } else{

      if (poseLabel == "MOUNTAIN") {
        text("MOUNTAIN POSE", width / 4, height - 10);
      } else if (poseLabel == "GODDESS") {
        text("GODDESS POSE", width / 4, height - 10);
      } else if (poseLabel == "GARLAND") {
        text("GARLAND POSE", width / 4, height - 10);
      } else if (poseLabel == "PLANK") {
        text("PLANK POSE", width / 4, height - 10);
      }
    }
    // else if (poseLabel == "COBRA") {
    //   text("COBRA", width/2, height/2);

    // }
  }
  selected_pose = posesDropdown.value;
}

function end() {
  // document.location.href = "http://localhost:5501";
  console.log(count);
  console.log("Accuracy: ",count.correct/count.total)*100;
  count = { correct: 0, total: 0 };
  video.stop();
  video.remove();
}
