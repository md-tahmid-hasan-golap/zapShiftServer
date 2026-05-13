require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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




// parcel post api
    app.post("/parcels", async(req, res)=>{
        const newParcel = req.body;
        newParcel.createdAt = new Date();
        const result = await parcelsCollection.insertOne(newParcel);
        res.send(result);
    })



    //  parcel get api all Parcels
    app.get("/allParcels", async(req, res) => {
  
      const result = await parcelsCollection.find().toArray();
      res.send(result);
    })




       // may parcel get api
       app.get("/myParcel/:email", async(req, res) => {

        const email = req.params.email;
        const query = {senderEmail: email};
        const sort=  {sort: {createdAt: -1} }
        const result = await parcelsCollection.find(query,sort).toArray(); 
        res.send(result);
       })


         // delete parcel api
         app.delete("/deleteParcel/:id", async (req, res) => {
          const id = req.params.id;
          const quaery = {_id: new ObjectId(id)};  
          const result = await parcelsCollection.deleteOne(quaery);
          res.send(result);
         })

          // parcel details api
          app.get("/parcel/:id", async(req, res) => {
            const id = req.params.id;  
            const query = {_id: new ObjectId(id)};
            const result = await parcelsCollection.findOne(query);
            res.send(result); 


          } )


            // payment api

          // app.post("/create-checkout-session", async (req, res) => {
          //   const paymentInfo = req.body;
          //   const amount = parseInt(paymentInfo.cost ) * 100; 
          //   const session  = await stripe.checkout.sessions.create({

          //           ui_mode: "elements",
          //           line_items: [
          //            {
                   
          //         price_data : {
          //           currency: 'usd',
          //           unit_amount : amount,
          //           product_data: {
          //             name: paymentInfo.parcelName,
          //           }
          //         },
          //            quantity: 1,
          //         },
          //   ],
          //     customer_email: paymentInfo.senderEmail,

          //     mode: 'payment',
          //     metadata: {
          //       parcelId: paymentInfo.parcelId,

          //     },
          //     return_url: `${process.env.SITE_DOMAIN}/dashboard/payment-success`,
          //     cancel_url: `${process.env.SITE_DOMAIN}/dashboard/payment-cancel`,
          // });
          //    console.log(session);
          //    res.send({url: session.url});

          // })

app.post("/create-checkout-session", async (req, res) => {
  try {
    const paymentInfo = req.body;
    const amount = parseInt(paymentInfo.cost) * 100;

    const session = await stripe.checkout.sessions.create({
      
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amount,
            product_data: {
              name: paymentInfo.parcelName,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: paymentInfo.senderEmail,
      mode: 'payment',
      success_url: `${process.env.SITE_DOMAIN}/dashboard/payment-success`, 
      cancel_url: `${process.env.SITE_DOMAIN}/dashboard/payment-cancel`,
    });

    res.send({ url: session.url }); 
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});






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