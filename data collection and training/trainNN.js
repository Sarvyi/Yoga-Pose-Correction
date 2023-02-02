let nn;
const DATA_PATH = "data.json";
const NUM_OF_POSES = 2;
const NUM_OF_BODY_POS = 17;

// Loading the data before

function setup() {
  // Setup neural network
  // options = {
  //   task: "classification",
  //   inputs: NUM_OF_BODY_POS * 2, // x2 for x and y coordinates
  //   outputs: NUM_OF_POSES,
  //   debug: true,
  // };

  let options = {
    task: "classification",
    inputs: NUM_OF_BODY_POS * 2, // x2 for x and y coordinates
    outputs: NUM_OF_POSES,
    debug: true,
    learningRate: 0.01,
  };

  nn = ml5.neuralNetwork(options);
  nn.loadData(DATA_PATH, networkLoaded);
}

function networkLoaded() {
  console.log("Data loaded & Neural Network created!");
  nn.normalizeData(); // ml5js function to normalize data between 0 and 1

  // ml5js function to start the training takes training options and callback
  nn.train({ epochs: 100 }, trainingCompleteed);
}

function trainingCompleteed() {
  // call back function
  nn.save();
  console.log("Neural Network trained and Saved");
}
