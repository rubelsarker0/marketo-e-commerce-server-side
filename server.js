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

		/***********************************************************************************
		 * Orders APIS
		 ***********************************************************************************/

		app.get('/api/orders/all', async (req, res) => {
			const cursor = ordersCollection.find({});
			const allOrders = await cursor.toArray();
			res.send(allOrders.reverse());
		});

		app.get('/api/orders/:uid', async (req, res) => {
			const uid = req.params.uid;
			const query = { uid };

			const cursor = ordersCollection.find(query);
			const result = await cursor.toArray();
			res.send(result.reverse());
		});

		/***********************************************************************************
		 * Reviews APIS
		 ***********************************************************************************/

		app.get('/api/reviews/all', async (req, res) => {
			const cursor = reviewsCollection.find({});
			const allReviews = await cursor.toArray();
			res.send(allReviews.reverse());
		});

		/***********************************************************************************
		 * Find specific user by uid
		 ***********************************************************************************/

		app.get('/api/users/:uid', async (req, res) => {
			const uid = req.params.uid;
			const query = { uid };
			const result = await usersCollection.findOne(query);
			res.send(result);
		});

		/***********************************************************************************
		 * Find specific user by uid
		 ***********************************************************************************/

		// POST API FOR CREATE DESTINATION
		app.post('/api/create/destinations', async (req, res) => {
			const destinationData = req.body;

			const result = await destinationCollections.insertOne(destinationData);
			res.json(result);
		});

		//Bookings end points
		app.get('/api/Orders', async (req, res) => {
			const cursor = bookingOrderCollection.find({});

			const allOrders = await cursor.toArray();
			res.json(allOrders);
		});

		app.get('/api/orders/:uid', async (req, res) => {
			const uid = req.params.uid;
			const query = { uid: uid };

			const cursor = bookingOrderCollection.find(query);

			if ((await cursor.count()) === 0) {
				return res.json([]);
			}

			const result = await cursor.toArray();
			res.send(result.reverse());
		});

		// Create new destinations

		app.post('/api/booking/newOrder', async (req, res) => {
			const {
				price,
				place,
				email,
				uid,
				phone,
				paymentMethod,
				message,
				status,
				author,
			} = req.body;

			const bookingData = {
				uid,
				email,
				phone,
				paymentMethod,
				message,
				status,
				price,
				place,
				date: new Date().toDateString(),
				author,
			};
			const Result = await bookingOrderCollection.insertOne(bookingData);

			res.json(Result);
		});

		// DELETE API
		app.delete('/api/order/delete/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await bookingOrderCollection.deleteOne(query);

			res.json(result);
		});

		// Update Api

		// update order status pending to approved

		app.put('/api/order/update/status/:id', async (req, res) => {
			const id = req.params.id;
			const filter = { _id: ObjectId(id) };
			const options = { upsert: true };
			const updateDoc = {
				$set: {
					status: 'Approved',
				},
			};
			const result = await bookingOrderCollection.updateOne(
				filter,
				updateDoc,
				options
			);
			res.json(result);
		});

		app.put('/api/order/cancel/:id', async (req, res) => {
			const id = req.params.id;

			const filter = { _id: ObjectId(id) };

			const updateDoc = {
				$set: {
					status: 'Cancelled',
				},
			};
			const options = { upsert: true };

			const result = await bookingOrderCollection.updateOne(
				filter,
				updateDoc,
				options
			);
			res.json(result);
		});
	} finally {
		// await client.close()
	}
};
run().catch(console.dir);

app.listen(PORT, () => {
	console.log('server is running on port', PORT);
});
