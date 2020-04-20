const express = require('express')
const app = express();
const bodyParser = require('body-parser')
// const date = require(`${__dirname}/date.js`
const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://Admin-Jamil:Piza7588@cluster0-couqk.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true})
const _ = require('lodash')
const itemSchema = {
    name: String
}

const Item = mongoose.model('Item', itemSchema)

const item1 = new Item({
    name: 'To Do'
})
const item2 = new Item({
    name: 'Check the box to delete'
})
const item3 = new Item({
    name: 'Press the plus to add'
})

const defaultItems = [item1,item2,item3];

const listSchema = {
    name: String,
    items: [itemSchema]
}

const List = mongoose.model('List', listSchema);

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))

app.get('/', (req, res) => {
    Item.find((err, result) => {
        if (result.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                if(err) {
                    console.log(err)
                } else {
                    console.log(`Nice, you have succeeded in what you wanted in life...`)
                }
            })
            res.redirect('/')
        }
        res.render('list', {listTitle: "Today", newItems: result});

    })
    // let day = date.getDay();
})

app.listen(3000, () => {
    console.log('We making a to do list!')
})

app.set('view engine', 'ejs') 

app.post('/', (req, res) => {
    const itemName = req.body.addTask
    const listName = req.body.list
    const item = new Item({ name: itemName });

    if(listName === 'Today') {
        item.save();
        res.redirect('/')
    } else {
        List.findOne({name: listName}, (err, results) => {
            results.items.push(item)
            results.save();
            res.redirect(listName)
        })

    }

})

app.post('/delete', (req, res) => {
    const itemId = req.body.checkbox
    const listName = req.body.listName
    if(listName === 'Today') {
        Item.findByIdAndDelete(itemId, (err) => {
            if(err) {
                console.log(err)
            } else {
                console.log('Deleted!')
            }
        })
        res.redirect('/')
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}}, (err, results) => {
            if(!err) {
                res.redirect(listName)
            }
           
        })
    }


})

app.get('/:route', (req, res) => {
    const customListName = _.capitalize(req.params.route)
    
    List.findOne({name: customListName}, (err, results) => {
        if(!err) {
            if(!results) {
                console.log(`Doesn't exist..`)
                console.log('success! You have created a list.')
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
                list.save();
                res.redirect(customListName);
            } else {
                console.log(`Exists!`)
                res.render('list', {listTitle: results.name, newItems: results.items});
            }
        }

    })

})

// app.post('/work', (req,res) => {
//     let item = req.body.addTask
//     workItems.push(item)
//     res.redirect('/work')
// })

// app.get('/about', (req, res) => {
//     res.render('about')
// })