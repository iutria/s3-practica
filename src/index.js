import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import AWS from 'aws-sdk';
import path from 'path';

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRECT_ACCESS_KEY,
  region: process.env.REGION
});
  
const S3 = new AWS.S3();
const app = express();

const upload = multer({ dest: 'temp/',  });

const deleteTempImage = (imgPath)=>{
  fs.unlink(imgPath, (err) => {
    console.log('error al borrar la imagen temporal')
  })
}

app.post('/', upload.single('file'), (req, res) => {
  const archivo = req.file;
  const file = fs.createReadStream(archivo.path);
  const ext = path.extname(archivo.originalname);
  
  const params = {
    Bucket: `${process.env.BUCKET}`,
    Key: req.body.name + ext,
    Body: file
  };

  S3.upload(
    params, 
    (err, data) => {
      deleteTempImage(archivo.path)
      if (err) {
        res.status(500).send(`Error al subir el archivo ${err}`);
      } else {
        res.send(`Archivo subido exitosamente URL: ${data.Location}`);
      }
    }
  );
})

app.listen(
  process.env.PORT,
  ()=>console.log(`http://localhost:${process.env.PORT}`)
)
