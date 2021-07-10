const mongoose=require('mongoose');

// database connection
const connectDB = () =>{
  var dbURI; 
if(process.env.NODE_ENV !== "production")
  {
    dbURI=process.env.DATABASE_LOCAL;
  }
else
  {
    dbURI = process.env.DATABASE;
  }
console.log(dbURI);
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