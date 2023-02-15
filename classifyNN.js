let video;
let pose;
let skeleton;
let pose_names = ["MOUNTAIN", "GODDESS", "GARLAND", "PLANK"];
let poseLabel;
let poseNet;
let knn;
const DATA_PATH = "./data.json";

let maxKneeFlexion = 180;
let maxHipFlexion = 180;
let maxDorsiflexion = 180;
let maxTrunkLean = 180;

let knee, hip, ankle, kneeFlexion, dorsiflexion, hipFlexion, shoulder, anKnee, sHip, trunkLean;

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
    knn.classify(poseArray, gotResult);
  } else {
    setTimeout(classifyPose, 1000);
  }
}

function gotResult(error, results) {
  // if (results[0].confidence > 0.7) {
    console.log(results)
    poseLabel = pose_names[parseInt(results.label)];
    // console.log(results[0]); 
    // poseLabel = results.poseLabel
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
  // }
  // else{
  //   poseLabel = "Incorrect pose";
  // }
  classifyPose();
}

function getPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
    
} 
}

function getAngle(poses) 
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
  
  // //Super hacky way to get rid of errors - make this better!
  // if (pose) {
  //   if (frameCount % 200 == 0) {
  //     classifyPose(); 
  //   }
  // } 
}


