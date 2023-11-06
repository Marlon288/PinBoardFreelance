const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

app.post('/submit-form', (req, res) => {
    // Assume req.body will contain the form data in JSON format
    const formData = req.body;
    
    // Generate a unique identifier for the submission, like a timestamp or UUID
    const submissionId = Date.now();
    
    // Save the JSON data to a file
    const filePath = path.join(dataDir, `submission-${submissionId}.json`);
    fs.writeFile(filePath, JSON.stringify(formData, null, 2), (err) => {
        if (err) {
            console.error('Error saving JSON data:', err);
            res.status(500).json({ success: false, message: 'Error saving form data' });
            return;
        }

        // Respond with a success message
        res.json({
            success: true,
            message: 'Form data saved successfully!',
            submissionId: submissionId
        });
    });
});
app.get('/submissions', async (req, res) => {
  const directoryPath = path.join(__dirname, 'data');
  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      console.log('Unable to scan directory: ' + err);
      res.status(500).send('Unable to read submissions');
      return;
    }
    let submissions = [];
    files.forEach(function (file) {
      let rawData = fs.readFileSync(path.join(directoryPath, file));
      let submission = JSON.parse(rawData);
      // Add the 'id' property which is the name of the file without the extension
      submission.id = path.basename(file, '.json');
      submissions.push(submission);
    });
    res.json(submissions);
  });
});
app.get('/submissions/:id', (req, res) => {
  const submissionId = req.params.id; // This is the name of your file without the .json extension
  const filePath = path.join(__dirname, 'data', `${submissionId}.json`);

  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
          console.log('Error reading file:', err);
          res.status(500).send('Error reading submission');
          return;
      }
      let submission = JSON.parse(data);
      // Add the 'id' property which is the name of the file without the extension
      submission.id = submissionId;
      res.json(submission);
  });
});





// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
