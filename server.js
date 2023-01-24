
//  if(process.env.NODE_ENV !== 'production') {
//     require('dotenv').config()
//  }

//  const mongoose = require('mongoose');

// const app = require('./app');

// dotenv.config({path:'./config.env'});

// const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

// mongoose.connect(process.env.DATABASE_LOCAL,{
//     useNewUrlParser:true
// }).then((err)=>{
//     if(err) console.error(err)
//     else console.log("success")
// })
// const db = mongoose.connection
// db.on('error',error => console.log(error))
// db.once('open', () => console.log('connected to Mongoose'))

// mongoose.connect(process.env.DATABASE_LOCAL, {
//    useNewUrlParser: true,
//     useCreateIndex: true,
//    useFindAndModify: false
// }).then(() => console.log('db is connected'));

// app.listen(port,() =>{
//  console.log('app running on PORT');
// });
