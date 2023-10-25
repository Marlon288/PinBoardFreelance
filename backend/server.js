const express = require('express');
const multer = require('multer');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Set up multer for storing uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ storage: storage });

// Ensure upload directory exists

if (!fs.existsSync('./uploads')){
    fs.mkdirSync('./uploads');
}

app.post('/upload', upload.single('pdf'), async (req, res) => {
    if (req.file) {
        // File has been uploaded successfully

        // Generate a QR code that points to the uploaded file
        //Change this to URL
        //const filePath = `http://your-server-domain-or-ip/uploads/${req.file.filename}`;
        const filePath = `http://localhost:3000/uploads/${req.file.filename}`;
        
        const qrDataURL = await QRCode.toDataURL(filePath);  // Convert the filePath to a QR Code

        res.json({
            success: true,
            message: 'File uploaded successfully!',
            filePath: filePath,
            qrCode: qrDataURL
        });
    } else {
        res.json({
            success: false,
            message: 'Error uploading file!'
        });
    }
});

// Server uploaded PDFs
app.use('/pdf', express.static('uploads'));

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
