const express = require('express');
const bodyParser = require ('body-parser');
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(bodyParser.json());
const fs = require("fs");
const exampleData = fs.readFileSync("./example.json");
const project = JSON.parse(exampleData);
const audioElements = project.audio_blocks;


// Add Audio Element

app.post('/audio-elements', (req, res) => {
  const audioElement = req.body;
  audioElement.id = uuidv4();
  
  // Check if the audio element has a valid video component ID
  if (audioElement.type === 'video_music' && !audioElement.video_component_id) {
    res.status(400).json({ error: 'Invalid video component ID' });
    return;
  }
  
  // Determine whether to add the audio element to video_blocks or audio_blocks
  if (audioElement.type === 'video') {
    project.video_blocks.push(audioElement);
  } else {
    project.audio_blocks.push(audioElement);
  }
  
  // Update the example.json file with the modified project data
  fs.writeFileSync('example.json', JSON.stringify(project, null, 2));
  
  res.status(201).json(audioElement);
});




// Get Audio Element by ID
app.get('/audio-elements/:id', (req, res) => {
  const id = req.params.id;
  const audioElement = audioElements.find((element) => element.id === id);
  if (audioElement) {
    res.json(audioElement);
  } else {
    res.status(404).json({ error: 'Audio element not found' });
  }
});

// Delete Audio Element by ID

app.delete("/audio-elements/:id", (req, res) => {
  const id = req.params.id;
  const index = audioElements.findIndex((element) => element.id === id);
  
  if (index !== -1) {
    audioElements.splice(index, 1);

    // Update the example.json file with the modified audioElements array
    project.audio_blocks = audioElements;
    fs.writeFileSync("example.json", JSON.stringify(project, null, 2));

    res.sendStatus(200);
  } else {
    // Check if the audio element is present in video_blocks
    const videoIndex = project.video_blocks.findIndex((element) => element.id === id);
    
    if (videoIndex !== -1) {
      project.video_blocks.splice(videoIndex, 1);

      // Update the example.json file with the modified video_blocks array
      fs.writeFileSync("example.json", JSON.stringify(project, null, 2));

      res.sendStatus(200);
    } else {
      res.status(404).json({ error: "Audio element not found" });
    }
  }
});


// Update Audio Element by ID
app.put("/audio-elements/:id", (req, res) => {
  const id = req.params.id;
  const updatedElement = req.body;
  const index = audioElements.findIndex((element) => element.id === id);

  if (index !== -1) {
    audioElements[index] = { ...audioElements[index], ...updatedElement };

    // Update the example.json file with the modified audioElements array
    project.audio_blocks = audioElements;
    fs.writeFileSync("example.json", JSON.stringify(project, null, 2));

    res.status(200).json(audioElements[index]);
  } else {
    res.status(404).json({ error: "Audio element not found" });
  }
});


// Get Audio Fragments between start-time and end-time
app.get("/audio-fragments/:start/:end", (req, res) => {
  const startTime = parseInt(req.params.start);
  const endTime = parseInt(req.params.end);

  const audioFragments = audioElements.filter(
    (element) =>
      element.duration &&
      element.duration.start_time >= startTime &&
      element.duration.end_time <= endTime
  );

  res.json(audioFragments);
});


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});


