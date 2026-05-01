require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 3000;




app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.u8prwai.mongodb.net/?appName=Cluster0`;










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

    const parcelsCollection = client.db('zapshift').collection('parcels');


    app.post("/parcels", async(req, res)=>{
        const newParcel = req.body;
        const result = await parcelsCollection.insertOne(newParcel);
        res.send(result);
    })




















    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
































// Root Route
app.get('/', (req, res) => {
  res.send('ZapShift Delivery Server is running... 🚀');
});

app.listen(port, () => {
  console.log(`ZapShift server listening on port ${port}`);
});