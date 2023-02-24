let video;
let pose;
let skeleton;
let pose_names = ["MOUNTAIN", "GODDESS", "GARLAND", "PLANK"];
let angles;
// let pose_angles = {"MOUNTAIN":["KHH","WEH"], "GODDESS": ["WES","ESH","AKH"], "GARLAND": [""]}
let posesDropdown;
let selected_pose;
let poseLabel;
let poseNet;
let knn;
const DATA_PATH = "./data.json";

let maxKneeFlexion = 180;
let maxHipFlexion = 180;
let maxDorsiflexion = 180;
let maxTrunkLean = 180;

// let knee, hip, ankle, kneeFlexion, dorsiflexion, hipFlexion, shoulder, anKnee, sHip, trunkLean;

// Loading the data before

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // create options of poses in dropdown 
  posesDropdown = document.getElementById("poses_dropdown");

  pose_names.forEach(name => {
    posesDropdown.options[posesDropdown.options.length] = new Option(name, name);
  });

  selected_pose = posesDropdown.value;

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
    const poseArray = pose.keypoints.map(p => [p.score, p.position.x, p.position.y]);
    // knn.addExample(poseArray, targetPose);
    knn.classify(poseArray, ()=>{
      setInterval(() => {
        // console.log(angles);
        gotResult();
      }, 3000);
    });

  } else {
    setTimeout(classifyPose, 1000);
  }
}
function in_range(low, val, high) {
  if (val < low){
    return -1
  }
  else if (val > high){
    return 1;
  }
  else{
    return 0
  }

}

function gotResult(error, results) {
  /*
  if (results[0].confidence > 0.7) {
    console.log(results)
  poseLabel = pose_names[parseInt(results.label)];
    console.log(results[0]); 
    poseLabel = results.poseLabel
    if (results[0].label == "Pose0") {
      poseLabel = "Pose0";
    } else if (results[0].label == "Pose1") {
      poseLabel = "Pose1";
    } else if (results[0].label == "Pose2") {
      poseLabel = "Pose2";
    } else {
      poseLabel = "Incorrect pose";
    }
  
  }
  else{
    poseLabel = "Incorrect pose";
  }
  */
  if(results){
  // console.log(results);
  poseLabel = pose_names[parseInt(results.label)];
  // working with angles...
  if (poseLabel == selected_pose){
    
    switch (selected_pose) {
      case "MOUNTAIN":
        // important angles wrt mountain pose        
        let range = in_range(80, angles.left.KHH, 100)
        if (range == -1) {
          // do something
        } else if (range == 1) {
          // do something
        } else {
          // something else
        }
        // in_range(80, angles.right.KHH, 100);
        // in_range(20, angles.left.WEH, 30)
        break;
    }
  }
  classifyPose();
}
}

function getPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton; 

    setInterval(() => {
      calculateAngles(pose);
    }, 3000); // calculate angles every 3 seconds
  } 
}

/*
  * Calculates the angle ABC (in radians)
  *
  * A first point, ex: {x: 0, y: 0}
  * C second point
  * B center point
*/

function angle(A, B, C) {
  let AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
  let BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
  let AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
  ans = (Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)) * 180) / Math.PI;
  return Math.round(ans*100)/100;
}

function calculateAngles(pose){
  let ankle = [pose.leftAnkle, pose.rightAnkle];
  let knee = [pose.leftKnee, pose.rightKnee];
  let hip = [pose.leftHip, pose.rightHip];
  let elbow = [pose.leftElbow, pose.rightElbow];
  let shoulder = [pose.leftShoulder, pose.rightShoulder];
  let wrist = [pose.leftWrist, pose.rightWrist];

  angles = {
    left: {
      KHH: angle(knee[0], hip[0], hip[1]), // left knee left hip right hip
      WEH: angle(wrist[0], elbow[0], hip[0]), // wrist elbow hip
      WES: angle(wrist[0], elbow[0], shoulder[0]), // wrist elbow shoulder
      AKH: angle(ankle[0], knee[0], hip[0]), // ankle knee hip
      ESH: angle(elbow[0], shoulder[0], hip[0]), // elbow shoulder hip
      SEW: angle(shoulder[0], elbow[0], wrist[0]), // shoulder elbow wrist
    },
    right: {
      KHH: angle(knee[1], hip[1], hip[0]), // right knee right hip left hip
      WEH: angle(wrist[1], elbow[1], hip[1]), // wrist elbow hip
      WES: angle(wrist[1], elbow[1], shoulder[1]), // wrist elbow shoulder
      AKH: angle(ankle[1], knee[1], hip[1]), // ankle knee hip
      ESH: angle(elbow[1], shoulder[1], hip[1]), // elbow shoulder hip
      SEW: angle(shoulder[1], elbow[1], wrist[1]), // shoulder elbow wrist
    },
  };
}

/* reference code
function getAngleTemp(poses) 
{
  switch (side) {
    case 'left':
      knee = poses[0].pose.leftKnee;
      hip = poses[0].pose.leftHip;
      ankle = poses[0].pose.leftAnkle;
      shoulder = poses[0].pose.leftShoulder;
      anKnee = { x: knee.x, y: ankle.y };
      sHip = { x: shoulder.x, y: hip.y };
      kneeFlexion =
        (Math.atan2(ankle.y - knee.y, ankle.x - knee.x) - Math.atan2(hip.y - knee.y, hip.x - knee.x)) *
        (180 / Math.PI);
      hipFlexion =
        360 -
        (Math.atan2(knee.y - hip.y, knee.x - hip.x) -
          Math.atan2(shoulder.y - hip.y, shoulder.x - hip.x)) *
          (180 / Math.PI);
      dorsiflexion =
        360 -
        (Math.atan2(anKnee.y - ankle.y, anKnee.x - ankle.x) -
          Math.atan2(knee.y - ankle.y, knee.x - ankle.x)) *
          (180 / Math.PI);
      trunkLean =
        360 -
        (Math.atan2(sHip.y - hip.y, sHip.x - hip.x) -
          Math.atan2(shoulder.y - hip.y, shoulder.x - hip.x)) *
          (180 / Math.PI);
      break;
    case 'right':
      knee = poses[0].pose.rightKnee;
      hip = poses[0].pose.rightHip;
      ankle = poses[0].pose.rightAnkle;
      shoulder = poses[0].pose.rightShoulder;
      anKnee = { x: knee.x, y: ankle.y };
      sHip = { x: shoulder.x, y: hip.y };
      kneeFlexion =
        360 -
        (Math.atan2(ankle.y - knee.y, ankle.x - knee.x) - Math.atan2(hip.y - knee.y, hip.x - knee.x)) *
          (180 / Math.PI);
      hipFlexion =
        (Math.atan2(knee.y - hip.y, knee.x - hip.x) -
          Math.atan2(shoulder.y - hip.y, shoulder.x - hip.x)) *
        (180 / Math.PI);
      dorsiflexion =
        (Math.atan2(anKnee.y - ankle.y, anKnee.x - ankle.x) -
          Math.atan2(knee.y - ankle.y, knee.x - ankle.x)) *
        (180 / Math.PI);
      trunkLean =
        (Math.atan2(sHip.y - hip.y, sHip.x - hip.x) -
          Math.atan2(shoulder.y - hip.y, shoulder.x - hip.x)) *
        (180 / Math.PI);
  }
}

function switchSides() {
	switch (side) {
		case 'left':
			side = 'right';
			select('#sideInstruction').html('right');
			resetMax();
			break;
		case 'right':
			side = 'left';
			select('#sideInstruction').html('left');
			resetMax();
	}
}
*/

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
  if (selected_pose != 'none'){
    image(video, 0, 0, width, height);

    // We can call both functions to draw all keypoints and the skeletons
    drawKeypoints();
    drawSkeleton();
    
    fill(0,255,0);
    textSize(64);
    //text(classificationResult, width/2, height/2);
    
    if (poseLabel == "MOUNTAIN") {
      text("MOUNTAIN", width/2, height/2);
      
    } 
    else if (poseLabel == "GODDESS") {
      text("GODDESS", width/2, height/2);
      
    }
    else if (poseLabel == "GARLAND") {
      text("GARLAND", width/2, height/2);
      
    }
    else if (poseLabel == "PLANK") {
      text("PLANK", width/2, height/2);
      
    }
    // else if (poseLabel == "COBRA") {
    //   text("COBRA", width/2, height/2);
      
    // }
    else 
    {
      text("INCORRECT POSE", width/2, height/2);
    }
  }
  selected_pose = posesDropdown.value;
}

