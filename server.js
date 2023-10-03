import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from 'cors';


const app = express()
const port = 3006

app.use(express.json())
app.use(express.static('public'))

app.use(
    cors({
        origin: "http://127.0.0.1:3006",
    }));

const client = new MongoClient('mongodb://127.0.0.1:27017')
await client.connect()

const db = client.db('bank')
const accountCollection = db.collection('accounts')

// get all accounts
app.get('/accounts', async (req, res) => {
    const accounts = await accountCollection.find({}).toArray();
    res.json(accounts);
})


// get account by ID
app.get('/accounts/:id', async (req, res) => {
    const account = await accountCollection.findOne({ _id: new ObjectId(req.params.id) });
    res.json(account)
})


// create new account
app.post('/accounts', async (req, res) => {
    let { accountName, sum } = req.body;
    if (sum === "") {
        sum = 0
    }
    await accountCollection.insertOne({
        accountName: accountName,
        sum: Number(sum),
        accountNumber: new ObjectId()
    })
    res.json({
        success: true,
        data: req.body
    })
})


// update sum, withdrawal
app.put('/accounts/:id/withdrawal', async (req, res) => {
    const account = await accountCollection.findOne({ _id: new ObjectId(req.params.id) })
    if (account.sum < req.body.sum) {
        res.json({
            success: false,
            message: "Not enough money"
        })
    } else {
        await accountCollection.updateOne({ _id: new ObjectId(req.params.id) }, {
            $set: {
                ...account,
                sum: account.sum - req.body.sum,
            }
        })
        res.json({
            success: true,
            data: req.body
        })

    }
})


// update sum, deposit
app.put('/accounts/:id/deposit', async (req, res) => {
    const account = await accountCollection.findOne({ _id: new ObjectId(req.params.id) })
    if (0 > req.body.sum) {
        res.json({
            success: false,
            message: "No negative amounts"
        })
    } else {
    await accountCollection.updateOne({ _id: new ObjectId(req.params.id) }, {
        $set: {
            ...account,
            sum: account.sum + req.body.sum,
        }
    })
    res.json({
        success: true,
        data: req.body
    })
    }
})


// delete 
app.delete('/accounts/:id', async (req, res) => {
    await accountCollection.deleteOne({ _id: new ObjectId(req.params.id) })
    res.json({
        success: true
    })
})



app.listen(port, () => { `Listening on port ${port}` })