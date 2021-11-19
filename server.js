const { MongoClient } = require('mongodb');
const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

const PORT = process.env.PORT || 5000;

// MIDDLEWARE connection
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
	res.send('Marketo server is running');
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hrqbo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const run = async () => {
	try {
		await client.connect();
		const database = client.db('marketoDB');
		const usersCollection = database.collection('users');
		const productsCollection = database.collection('products');
		const ordersCollection = database.collection('orders');
		const reviewsCollection = database.collection('reviews');

		/***********************************************************************************
		 * Products APIS
		 ***********************************************************************************/
		app.get('/api/products/all', async (req, res) => {
			const cursor = productsCollection.find({});
			const allProducts = await cursor.toArray();
			res.send(allProducts.reverse());
		});

		//get specific products
		app.get('/api/products/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await productsCollection.findOne(query);
			res.send(result);
		});

		app.post('/api/products/create', async (req, res) => {
			const productData = req.body;

			const createProduct = await productsCollection.insertOne(productData);
			res.json(createProduct);
		});

		app.delete('/api/products/delete/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await productsCollection.deleteOne(query);

			res.json(result);
		});

		/***********************************************************************************
		 * Orders APIS
		 ***********************************************************************************/
		//All orders
		app.get('/api/orders/all', async (req, res) => {
			const cursor = ordersCollection.find({});
			const allOrders = await cursor.toArray();
			res.send(allOrders.reverse());
		});

		//Specfic orders by userId
		app.get('/api/orders/:uid', async (req, res) => {
			const uid = req.params.uid;
			const query = { uid };

			const cursor = ordersCollection.find(query);
			const result = await cursor.toArray();
			res.send(result.reverse());
		});

		//Create new order
		app.post('/api/orders/create', async (req, res) => {
			const ordersData = req.body;

			const createOrder = await ordersCollection.insertOne(ordersData);
			res.json(createOrder);
		});

		// Update Order
		app.put('/api/order/update/:status/:id', async (req, res) => {
			const { id, status } = req.params;
			const filter = { _id: ObjectId(id) };
			const options = { upsert: true };
			const updateDoc = {
				$set: {
					status: status,
				},
			};
			const result = await ordersCollection.updateOne(
				filter,
				updateDoc,
				options
			);
			res.json(result);
		});

		// DELETE order
		app.delete('/api/order/delete/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await ordersCollection.deleteOne(query);

			res.json(result);
		});
		// create an user google user
		app.put('/api/users/createUser', async (req, res) => {
			const userData = req.body;
			const filter = { email: userData.email };
			const options = { upsert: true };
			const updateDoc = { $set: userData };
			const result = await usersCollection.updateOne(
				filter,
				updateDoc,
				options
			);
			res.json(result);
		});

		/***********************************************************************************
		 * Reviews APIS
		 ***********************************************************************************/

		app.get('/api/reviews/all', async (req, res) => {
			const cursor = reviewsCollection.find({});
			const allReviews = await cursor.toArray();
			res.send(allReviews.reverse());
		});

		app.post('/api/reviews/create', async (req, res) => {
			const reviewsData = req.body;

			const createReview = await reviewsCollection.insertOne(reviewsData);
			res.json(createReview);
		});

		/***********************************************************************************
		 * Users APIS
		 ***********************************************************************************/

		app.post('/api/users/create', async (req, res) => {
			const userData = req.body;

			const createUser = await usersCollection.insertOne(userData);
			res.json(createUser);
		});

		app.get('/api/users/:uid', async (req, res) => {
			const uid = req.params.uid;
			const query = { uid };
			const result = await usersCollection.findOne(query);
			res.send(result);
		});

		/***********************************************************************************
		 * Admin APIS
		 ***********************************************************************************/

		app.put('/api/admin/create/:email', async (req, res) => {
			const { email } = req.params;
			const filter = { email };
			const options = { upsert: true };
			const updateDoc = {
				$set: {
					role: 'admin',
				},
			};
			const result = await usersCollection.updateOne(
				filter,
				updateDoc,
				options
			);
			res.json(result);
		});

		app.get('/api/products/:uid', async (req, res) => {
			const uid = req.params.uid;
			const query = { uid };
			const cursor = productsCollection.find(query);
			const result = await cursor.toArray();
			res.send(result.reverse());
		});
	} finally {
		// await client.close()
	}
};
run().catch(console.dir);

app.listen(PORT, () => {
	console.log('server is running on port', PORT);
});
