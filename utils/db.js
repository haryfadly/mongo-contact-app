const mongoose = require('mongoose');
// mongoose.connect('mongodb://127.0.0.1:27017/satu', {
mongoose.connect('mongodb+srv://root:spasi@clustersatu.fua1n.mongodb.net/satu?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});



// // menambah 1 data
// const contact1 = new Contact({
//     nama: 'Asep',
//     nohp: '0822222222',
//     email: 'gmail@asep.com',
// });

// // simpan ke collection
// contact1.save().then((contact) => console.log(contact));

