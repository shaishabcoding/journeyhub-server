const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("server running!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bhmvsbs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const spotsDB = client.db("spotsDB");
    const spotsCollection = spotsDB.collection("spots");
    const slidesCollection = spotsDB.collection("slides");

    app.get("/spots", async (req, res) => {
      const result = await spotsCollection.find().toArray();
      res.send(result);
    });

    app.get("/slides", async (req, res) => {
      const result = await slidesCollection.find().toArray();
      res.send(result);
    });

    app.get("/spot/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await spotsCollection.findOne(query);
      res.send(result);
    });

    app.get("/spots/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const cursor = spotsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/spots/new", async (req, res) => {
      const newSpot = req.body;
      const result = await spotsCollection.insertOne(newSpot);
      res.send(result);
    });

    app.post("/slides/new", async (req, res) => {
      const newSpot = req.body;
      const result = await slidesCollection.insertOne(newSpot);
      res.send(result);
    });

    app.put("/spot/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedSpot = {
        $set: req.body,
      };
      const result = await spotsCollection.updateOne(
        query,
        updatedSpot,
        options
      );
      res.send(result);
    });

    app.delete("/spot/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await spotsCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
