const express = require('express');
const app = express();
const fs = require('fs');
const multer = require('multer');
const { TesseractWorker } = require('tesseract.js');
const worker = new TesseractWorker();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage }).single('image');

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.get('/download', (req, res) => {
  const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
  res.download(file);
});

app.post('/upload', (req, res) => {
  upload(req, res, err => {
    // console.log(req.file);
    fs.readFile(`./uploads/${req.file.originalname}`, (error, data) => {
      if (error) return console.log('Error message: ', error);

      worker
        .recognize(data, 'eng', { tessjs_create_pdf: '1' })
        .progress(progress => {
          console.log(progress);
        })
        .then(result => {
          // res.send(result.text);
          res.redirect('/download');
        })
        .finally(() => {
          worker.terminate();
        });
    });
  });
});

const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
