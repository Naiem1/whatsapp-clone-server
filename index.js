// Require
const express = require("express");
const Mongoose = require("mongoose");
const Message = require("./msgSchema");
const Pusher = require("pusher");
const cors = require("cors");

// App Config
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());
require("dotenv").config();

// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("Access-Control-Allow-Headers", "*");
//   next();
// });
// Connection
const db_url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vc8eu.mongodb.net/${process.env.DB_DBN}?retryWrites=true&w=majority`;
Mongoose.connect(db_url, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("connection is successfully");
  })
  .catch((err) => {
    console.log("Error");
  });

const db = Mongoose.connection;
db.once("open", () => {
  console.log("DB Connected");
  const msgCollection = db.collection("messages");
  const changeStream = msgCollection.watch();
  changeStream.on("change", (change) => {
    // console.log("change");
    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
      });
    } else {
      console.log("Error Pusher");
    }
  });
});
const pusher = new Pusher({
  appId: "1115900",
  key: "2be980cecf9a2313cfd7",
  secret: "abf2c1e7099b1d34ebb8",
  cluster: "mt1",
  useTLS: true,
});

pusher.trigger("my-channel", "my-event", {
  message: "hello world",
});
// Get/Post
app.get("/", (req, res) => {
  res.status(200).send("Server site");
});
app.get("/message/show", (req, res) => {
  Message.find((err, document) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(document);
    }
  });
});

app.post("/message/new", (req, res) => {
  // console.log(req.body);
  const newMessage = req.body;
  Message.create(newMessage, (err, document) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(document);
    }
  });
});
// Listen
app.listen(port, () => console.log(`server site is running on ${port}`));
