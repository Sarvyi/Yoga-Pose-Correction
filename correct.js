let video;
let pose;
let skeleton;
let pose_names = ["MOUNTAIN", "GODDESS", "GARLAND", "PLANK"];
let angles;
let posesDropdown;
let msgSpan;
let tts_msg;
let selected_pose;
let poseNet;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // create options of poses in dropdown
  posesDropdown = document.getElementById("poses_dropdown");
  msgSpan = document.getElementById("message");
  
  // text to speech setup check
  if ("speechSynthesis" in window) {
    // Speech Synthesis supported 🎉
    tts_msg = new SpeechSynthesisUtterance();
    alert("Text to Speech setup complete!");
    console.log(speechSynthesis.getVoices());
    voices = speechSynthesis.getVoices();
    if (voices.length){ // set voice to Heera if available
      tts_msg.voice = voices[2]; // Microsoft Heera
      alert(tts_msg.voice);
    }
  } else {
    // Speech Synthesis Not Supported 😣
    alert("Sorry, your browser doesn't support text to speech!");
  }

  pose_names.forEach((name) => {
    posesDropdown.options[posesDropdown.options.length] = new Option(
      name,
      name
    );
  });

  tts_msg.text = "Select your pose from the dropdown menu";
  window.speechSynthesis.speak(tts_msg); 

  selected_pose = posesDropdown.value;

  // setup posenet model
  // posenet requires input image/video and a callback function
  poseNet = ml5.poseNet(video, modelLoaded);

  // on() function is called on seeing a pose.
  // the object of bodypoints is given to callback function getPoses
  setInterval(() => {
    poseNet.on("pose", getPoses);
  }, 3000);

  // getPoses initializes pose and skeleton variables
}

// call back function
function modelLoaded() {
  console.log("PoseNet model loaded!");
  correction();

}


function display(msg) {
  msgSpan.innerHTML = msg;
  tts_msg.text = msg;
  window.speechSynthesis.speak(tts_msg); 
}

function in_range(low, val, high) {
  if (val > low && val < high) {
    return 0;
  } else if (val < low) {
    return -1;
  } else if (val > high) {
    return 1;
  }
}

function correction(params) {
  if (pose) {
    const poseArray = pose.keypoints.map((p) => [
      p.score,
      p.position.x,
      p.position.y,
    ]);
    setInterval(() => {
      // console.log(angles);
      if (selected_pose != "none") { // if a pose is selected then only correct
        let leftKHH_range,
          rightKHH_range,
          leftWEH_range,
          rightWEH_range,
          leftWES_range,
          rightWES_range,
          leftESH_range,
          rightESH_range,
          leftAKH_range,
          rightAKH_range,
          leftSEW_range,
          rightSEW_range;

        switch (selected_pose) {
          case "MOUNTAIN":
            leftKHH_range = in_range(85, angles.left.KHH, 90);
            rightKHH_range = in_range(85, angles.right.KHH, 90);
            leftWEH_range = in_range(25, angles.left.WEH, 30);
            rightWEH_range = in_range(25, angles.right.WEH, 30);

            if (leftKHH_range == -1 || rightKHH_range == -1) {
              display("Join your both legs");
            } else if (leftKHH_range == 0 || rightKHH_range == 0) {
              display("Legs perfect");
            } else {
              display("Join your both legs");
            }

            if (leftWEH_range == -1 || rightWEH_range == -1) {
              display("Spread your arms a little bit");
            } else if (leftWEH_range == 0 || rightQEH_range == 0) {
              display("Arms perfect");
            } else {
              display("Let your arms fall next to your waist");
            }
            break;

          case "GODDESS":
            leftWES_range = in_range(85, angles.left.WES, 90);
            rightWES_range = in_range(85, angles.right.WES, 90);
            leftESH_range = in_range(85, angles.left.ESH, 90);
            rightESH_range = in_range(85, angles.right.ESH, 90);
            leftAKH_range = in_range(100, angles.left.AKH, 110);
            rightAKH_range = in_range(100, angles.right.AKH, 110);

            if (leftWES_range == -1 || leftWES_range == 1) {
              display("Your left forearm should point upwards");
            } else if (rightWES_range == -1 || rightWES_RANGE == 1) {
              display("Your right forearm should point upwards");
            } else if (leftWES_range == 0 || rightWES_range == 0) {
              display("");
            }

            if (leftESH_range == -1) {
              display("Raise your left upper limb a little bit");
            } else if (rightESH_range == -1) {
              display("Raise your right upper limb a little bit");
            } else if (leftESH_range == 0 || rightESH_range == 0) {
              display("");
            } else if (leftESH_range == 1) {
              display("Lower uour left upper limb a little bit");
            } else if (rightESH_range == 1) {
              display("Lower your right upper limb a little bit");
            }

            if (leftAKH_range == -1) {
              display("Widen your left leg by keeping shin straight");
            } else if (rightAKH_range == -1) {
              display("Widen your right leg by keeping shin straight");
            } else if (leftAKH_range == 0 || rightAKH_range == 0) {
              display("");
            } else if (leftAKH_range == 1) {
              display("Contract your left leg by keeping shin straight");
            } else if (rightAKH_range == 1) {
              display("Contract your right leg by keeping shin straight");
            }
            break;

          case "GARLAND":
            leftAKH_range = in_range(30, angles.left.AKH, 40);
            rightAKH_range = in_range(30, angles.right.AKH, 40);

            if (leftAKH_range == -1) {
              display("Widen your left leg");
            } else if (rightAKH_range == -1) {
              display("Widen your right leg");
            } else if (leftAKH_range == 0 || rightAKH_range == 0) {
              display("");
            } else if (leftAKH_range == 1) {
              display("Contract your left leg");
            } else if (rightAKH_range == 1) {
              display("Contract your right leg");
            }
            break;

          case "PLANK":
            leftAKH_range = in_range(175, angles.left.AKH, 180);
            rightAKH_range = in_range(175, angles.right.AKH, 180);
            leftESH_range = in_range(70, angles.left.ESH, 80);
            rightESH_range = in_range(70, angles.right.ESH, 80);
            leftSEW_range = in_range(175, angles.left.SEW, 180);
            rightSEW_range = in_range(175, angles.right.SEW, 180);

            if (
              leftAKH_range == -1 ||
              rightAKH_range == -1 ||
              leftAKH_range == 1 ||
              rightAKH_range == 1
            ) {
              display(
                "Your back should be straight and parallel to the ground"
              );
            } else {
              display("");
            }

            if (leftESH_range == -1 || rightESH_range == -1) {
              display("Take your arms forward");
            } else if (leftESH_range == 1 || rightESH_range == 1) {
              display("Take your arms backwards");
            } else {
              display("");
            }

            if (
              leftSEW_range == -1 ||
              rightSEW_range == -1 ||
              leftSEW_range == 1 ||
              rightEW_range == 1
            ) {
              display("Your arms should be straight");
            } else {
              display("");
            }
            break;
        }
      }
    }, 500); // correction after every 0.5 sec
  } else {
    setTimeout(correction, 1000);
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
  ans =
    (Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)) * 180) / Math.PI;
  return Math.round(ans * 100) / 100;
}

function calculateAngles(pose) {
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
  }
  selected_pose = posesDropdown.value;
}
