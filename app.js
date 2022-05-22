const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const {body, validationResult, check} = require ('express-validator');
const methodOverride = require('method-override');

const session = require ('express-session');
const cookieParser = require ('cookie-parser');
const flash = require ('connect-flash');


require('./utils/db');
const Contact = require('./model/contact')

const app = express();
const port = 3000;

// setup method override
app.use(methodOverride('_method'));

// setup EJS
app.set('view engine', 'ejs'); // gunakan ejs
app.use(expressLayouts); // gunakan express-ejs-layouts
app.use(express.static('public')); // Built in middleware
app.use(express.urlencoded({extended: true}));

// konfigurasi flash
app.use(cookieParser('secret'));
app.use(
    session({
        cookie: {maxAge:6000},
        secret: 'secret',
        resave: true,
        saveUninitialized: true,
    })
);
app.use(flash());

// halaman home
app.get('/', (req, res) => {
    const mahasiswa = [
    {
        nama: 'Asep',
        email: 'gmail@asep.com',
        nohp: '08222222222',
    },{
        nama: 'Ujang',
        email: 'gmail@ujang.com',
        nohp: '08111111111',
    },
    {
        nama: 'Dadang',
        email: 'gmail@dadang.com',
        nohp: '08333333333',
    },
    ];

    res.render('index',{nama: 'Ujang', layout: 'layouts/main-layout', title: 'Halaman Utama', mahasiswa});
});

// halaman about
app.get('/about', (req, res) => {
    res.render('about', {layout: 'layouts/main-layout', title: 'Halaman About'});
});

// halaman contact
app.get('/contact', async (req, res) => {
    // Contact.find().then((contact) => {
    //     res.send(contact);
    // })
    
    const contacts = await Contact.find();

    res.render('contact', {
        layout: 'layouts/main-layout', 
        title: 'Halaman Contact',
        contacts,
        msg: req.flash('msg'),
    });
});

// halaman form tambah data kontak
app.get('/contact/add',(req, res) => {
    res.render('add-contact', {
        title: 'Form Tambah Data Kontak',
        layout: 'layouts/main-layout',
    });
});

// proses tambah data kontak
app.post('/contact', [
    body('nama').custom(async (value) => {
        const duplikat = await Contact.findOne({nama: value});
        if(duplikat){
            throw new Error ('Nama sudah digunakan!');
        }
        return true;
    }),
    check('email','Email tidak valid!').isEmail(),
    check('nohp','No handphone tidak valid!').isMobilePhone('id-ID')
    
], (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.render('add-contact', {
            title: 'Form Tambah Data Kontak',
            layout: 'layouts/main-layout',
            errors: errors.array(),
        });
    } else {
        Contact.insertMany(req.body, (error, result) => {
            // kirimkan flash message
            req.flash('msg', 'Data kontak berhasil ditambahkan!');
            res.redirect('/contact');
        });
    }
});

// proses delete contact
// app.get('/contact/delete/:nama', async (req, res) => {
//     const contact = await Contact.findOne({nama: req.params.nama});
//     // jika contact tidak ada
//     if(!contact) {
//         res.status(404);
//         res.send('<h1>404</h1>');
//     } else {
//         // Contact.deleteOne({ nama: req.params.nama});
//         Contact.deleteOne({ _id: contact._id }).then((result) => {
//             req.flash('msg', 'Data kontak berhasil dihapus!');
//             res.redirect('/contact');
//         });
//     }
// });

app.delete('/contact', (req, res) => {
    Contact.deleteOne({ nama: req.body.nama }).then((result) => {
        req.flash('msg', 'Data kontak berhasil dihapus!');
        res.redirect('/contact');
    });
});

// halaman form edit data kontak
app.get('/contact/edit/:nama', async(req, res) => {
    const contact = await Contact.findOne({nama: req.params.nama});
    
    res.render('edit-contact', {
        title: 'Form Ubah Data Kontak',
        layout: 'layouts/main-layout',
        contact,
    });
});

// proses ubah data kontak
app.put(
    '/contact', 
    [
    body('nama').custom(async (value, { req }) => {
        const duplikat = await Contact.findOne({nama: value});
        if(value !== req.body.oldNama && duplikat){
            throw new Error ('Nama sudah digunakan!');
        }
        return true;
    }),
    check('email','Email tidak valid!').isEmail(),
    check('nohp','No handphone tidak valid!').isMobilePhone('id-ID')
    
], (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.render('edit-contact', {
            title: 'Form Ubah Data Kontak',
            layout: 'layouts/main-layout',
            errors: errors.array(),
            contact: req.body,
        });
    } else {
        Contact.updateOne(
            { _id: req.body._id},
            {
                $set: {
                    nama: req.body.nama,
                    nohp: req.body.nohp,
                    email: req.body.email,
                },
            }
        ).then((result) => {
            // kirimkan flash message
            req.flash('msg', 'Data kontak berhasil diubah!');                
            res.redirect('/contact');
        });
    }
});

// halaman detail kontak
app.get('/contact/:nama', async(req, res) => {
    const contact = await Contact.findOne({nama: req.params.nama});

    res.render('detail', {
        layout: 'layouts/main-layout', 
        title: 'Halaman Detail Contact',
        contact,
    });
});



app.listen(port, () => {
    console.log(`Mongo Contact App | listening at http://localhost:${port}`);

});