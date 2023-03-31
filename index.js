const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');

const app = express();

//middlewares
app.use(cors());
app.use(express.json());
require('dotenv').config();

const port = process.env.PORT || 5000;

// MongoDB configs

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.cf3zfqk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});

async function run() {
	try {
		await client.connect();
		const productsCollection = client.db('emaJohn').collection('products');

		/////////////////////////////////////////////////
		///// Products
		app.get('/products', async (req, res) => {
			const page = +req.query.page;
			const size = +req.query.size;
			const query = {};
			const cursor = productsCollection.find(query);
			let result;

			if (page || size) {
				result = await cursor
					.skip(page * size)
					.limit(size)
					.toArray();
			} else {
				result = await cursor.toArray();
			}

			res.send(result);
		});

		app.get('/productsCount', async (req, res) => {
			const count = await productsCollection.estimatedDocumentCount();
			res.send({ count });
		});

		app.post('/productsbykeys', async (req, res) => {
			const keys = req.body;
			const ids = keys.map((key) => new ObjectId(key));
			const query = { _id: { $in: ids } };
			const cursor = productsCollection.find(query);
			const products = await cursor.toArray();

			res.send(products);
		});
	} finally {
		// client.close();
	}
}

run().catch(console.dir);

app.get('/', (req, res) => {
	res.send('server is running');
});

app.listen(port, () => {
	console.log(`Server is running at port ${port}`);
});
