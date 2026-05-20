const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const { configDotenv } = require('dotenv');
const express = require('express');
const app = express();
const port = 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
configDotenv();
const cors = require("cors");
const uri = process.env.MONGO_URI;
// Middleware to parse JSON
app.use(express.json());
app.use(cors());


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const db = client.db(process.env.DATABASE_NAME);
    const roomCollection = db.collection("rooms");

    app.post("/rooms", async(req, res) => {
      const room = req.body;
      console.log(room);
      const result = await roomCollection.insertOne(room);
      console.log(result);
      res.json(result);
    })
    app.get("/rooms/:user_id", async (req, res) => {
      const user_id = req.params.user_id;
      console.log(user_id);
      const result = await roomCollection
          .find({ user_id: user_id })
          .toArray();
      console.log(result);
      res.json(result);

  });
    // Send a ping to confirm a successful connection
    await client.db(process.env.DATABASE_NAME).command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

// Basic GET route
app.get('/', (req, res) => {
  res.send('Backend is live');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});