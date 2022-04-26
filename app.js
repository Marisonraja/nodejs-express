const express = require('express');
const bodyParser = require('body-parser');
const connection = require('./config/database');
const multer = require('multer');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// buat server nya
app.use(express.static("./public"))

 //! Use of Multerno
 var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
});


// create data / insert data
app.post('/api/movies', upload.single('image'), (req, res) => {
    const { judul, rating, deskripsi, foto, rilis, durasi, sutradara, pemain } = req.body;
    const sql = `INSERT INTO movies (judul, rating, deskripsi, foto, rilis, durasi, sutradara, pemain) VALUES ('${judul}', '${rating}', '${deskripsi}', '${foto}', '${rilis}', '${durasi}', '${sutradara}', '${pemain}')`;
    console.log(req.body)
    connection.query(sql, (err, result) => {
        if (err) throw err;
        res.send({
            message: 'New movie has been created',
            data: result
        });
    });
});

// read data / get data
app.get('/api/movies', (req, res) => {
    // buat query sql
    const querySql = 'SELECT * FROM movies';

    // jalankan query
    connection.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
});


// update data
app.put('/api/movies/:id', (req, res) => {
    // buat variabel penampung data dan query sql
    const data = { ...req.body };
    const querySearch = 'SELECT * FROM movies WHERE id = ?';
    const queryUpdate = 'UPDATE movies SET ? WHERE id = ?';

    // jalankan query untuk melakukan pencarian data
    connection.query(querySearch, req.params.id, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query update
            connection.query(queryUpdate, [data, req.params.id], (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika update berhasil
                res.status(200).json({ success: true, message: 'Berhasil update data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

    // delete data
app.delete('/api/movies/:id', (req, res) => {
    // buat query sql untuk mencari data dan hapus
    const querySearch = 'SELECT * FROM movies WHERE id = ?';
    const queryDelete = 'DELETE FROM movies WHERE id = ?';

    // jalankan query untuk melakukan pencarian data
    connection.query(querySearch, req.params.id, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika id yang dimasukkan sesuai dengan data yang ada di db
        if (rows.length) {
            // jalankan query delete
            connection.query(queryDelete, req.params.id, (err, rows, field) => {
                // error handling
                if (err) {
                    return res.status(500).json({ message: 'Ada kesalahan', error: err });
                }

                // jika delete berhasil
                res.status(200).json({ success: true, message: 'Berhasil hapus data!' });
            });
        } else {
            return res.status(404).json({ message: 'Data tidak ditemukan!', success: false });
        }
    });
});

//app.post('/api/moviesImages', upload.single('image'),(req, res) => {





app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));