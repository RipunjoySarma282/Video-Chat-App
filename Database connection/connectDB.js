const mongoose=require('mongoose');

// database connection
const connectDB = () =>{ 
const dbURI =process.env.DATABASE
mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((result) =>
    console.log("Database is connected successfully..")
  )
  .catch((err) => console.log(err));
}

module.exports = connectDB;