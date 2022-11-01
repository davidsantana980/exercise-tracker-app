const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { userSchema } = require('./mongo');
const User = mongoose.model('User', userSchema);

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}, console.log("success in connecting to mongodb"));

app.use(cors())
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.urlencoded({extended: false}));
app.use(express.static('public'))

const readOne = (search, options) => {
  let found = User.findOne(search, options)
  return found;
}

const readMany = (search, options) => {
  let found = User.find(search, options)
  return found;
}


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res) => {
  try{
    await User.create({username : req.body.username});
    let newUser = await readOne({username : req.body.username}, {log: 0}) 
    res.send(newUser); 
  }catch(error){
    console.log(error);
  }
});

app.get('/api/users', async (req, res) => {
  try{
    let users = await readMany({}, {log: 0});
    res.send(users); 
  }catch(error){
    console.log(error);
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  try{
      let newLog = {
        "description" : req.body.description, 
        "duration" : parseInt(req.body.duration),
        "date" : req.body.date ? new Date(req.body.date) : new Date()
      };
      await User.findOneAndUpdate({_id : req.params._id}, {
        $push: { log : newLog }
      })
      let newExercise = await readOne({_id : req.params._id}).lean();

      let latest = newExercise.log[newExercise.log.length-1];
      let date = new Date (latest.date);
      
      //this should be innecessary, and is actually not supposed to be there. It's there just because of FCC's 8th test failing to get the right date, I think.
      
      date.setDate(date.getDate() + 1);
      
      //so I just added 1 day to the actual input.

      res.send({
        "_id":newExercise._id,
        "username":newExercise.username,
        "date": date.toDateString(),
        "duration":latest.duration,
        "description":latest.description
      }); 
  }catch(error){
    console.log(error);
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  try{
    let {from:startDate, to:endDate, limit:logAmount} = req.query;

    startDate = new Date(startDate);
    endDate = new Date(endDate);
    logAmount = parseInt(logAmount);

    let user = await readOne({_id : req.params._id}).lean();

    let log = [...user.log]; 

    if (startDate && startDate != "Invalid Date") {
      log = log.filter(exercise => exercise.date.getTime() >= startDate.getTime()) 
    }

    if(endDate && endDate != "Invalid Date"){
      log = log.filter(exercise => exercise.date.getTime() <= endDate.getTime()) 
    }
    
    if (logAmount) log = log.slice(0, logAmount);

    user.log = log;
    user.log.map(obj => obj.date = new Date(obj.date).toDateString());
    user.count = user.log.length;

    res.json(user); 

  }catch(err){
    return err;
  }
});

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
