const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());

app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "https://food-blogging-ebb6d.web.app",
        "https://food-blogging-ebb6d.firebaseapp.com"
      ],
      credentials: true,
    })
);



console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1qpflqd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server (optional starting in v4.7)
    // await client.connect();

    const blogCollection = client.db('foodBlog').collection('blogs');
    const commentCollection = client.db('foodBlog').collection('comment');
    const wishListCollection = client.db('foodBlog').collection('wishlist');

    
    app.get('/wishlist', async (req, res) => {
        try {
          const userEmail = req.query.userEmail;
          const result = await wishListCollection.find({ userEmail }).toArray();
          res.json(result);
        } catch (error) {
          console.error('Error fetching wishlist data:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });
  
      // Route to add a new wishlist item
      app.post('/wishlist', async (req, res) => {
        try {
          const wishlistItem = req.body;
          const result = await wishListCollection.insertOne(wishlistItem);
          res.status(201).json(result.ops[0]);
        } catch (error) {
          console.error('Error inserting wishlist item:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });
  
      app.get('/blogs', async (req, res) => {
        const search = req.query.search;
        let query = {};
  
        if (search) {
          query.title = { $regex: new RegExp(search, 'i') };
        }
  
        const result = await blogCollection.find(query).toArray();
        res.send(result);
      });
  
      app.get('/blogs/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await blogCollection.findOne(query);
        res.send(result);
      });
  
      app.post('/blogs', async (req, res) => {
        const newFood = req.body;
        const result = await blogCollection.insertOne(newFood);
        res.send(result);
      });
  
      app.get('/wishlist/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await wishListCollection.findOne(query);
        res.send(result);
      });
  
      app.post('/comment', async (req, res) => {
        const commentData = req.body;
        const result = await commentCollection.insertOne(commentData);
        res.send(result);
      });
  
      app.get('/comment', async (req, res) => {
        const cursor = commentCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      });
  
      app.put('/blogs/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updatedBlog = req.body;
        const blog = {
          $set: {
            title: updatedBlog.title,
            image: updatedBlog.image,
            shortDescription: updatedBlog.shortDescription,
            longDescription: updatedBlog.longDescription,
            category: updatedBlog.category,
          }
        };
        const result = await blogCollection.updateOne(filter, blog, options);
        res.send(result);
      });
  
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('food is running');
});

app.listen(port, () => {
  console.log(`food blogging server is running on port ${port}`);
});