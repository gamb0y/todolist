//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const date = require(__dirname + '/date.js');


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const url = 'mongodb://localhost:27017/todolistDB';
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });


const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model('Item', itemSchema);


const item1 = new Item({
  name: "Welcome to your Todo List!"
});
const item2 = new Item({
  name: "Click the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Click this checkbox to delete the item."
});
const defaultItems = [item1, item2, item3];


const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model('List', listSchema);


const today = date.getDate();


app.get('/', function(req, res) {

  Item.find({}, function(err, items) {
    if (err) {
      console.log(err);
    } else {
      // console.log(items);

      if (items.length === 0) {

        Item.insertMany(defaultItems, function(err1) {
          if (err1) console.log(err1);
        });

        res.redirect('/');

      } else {

        res.render('list', {listTitle: today, newListItem: items });

      }
    }
  });
});


app.get('/:customListName', function(req, res) {

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, docs) {

    if (!err) {
      if (!docs) {

        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();

        res.redirect('/' + customListName);

      } else {
        res.render('list', {listTitle: docs.name, newListItem: docs.items});
      }
    }
  });
});


app.post('/', function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === today) {

    if (itemName) {
      item.save();
    }
    res.redirect('/');

  } else {

    if (itemName) {
      List.findOneAndUpdate({name: listName}, {$addToSet: {items: {'name': itemName}}}, function(err) {
        if (err) console.log(err);
      });
      // List.findOne({name: listName}, function(err, docs) {
      //   docs.items.push(item);
      //   docs.save();
      // });
    }
    res.redirect('/' + listName);
  }
});


app.post('/delete', function(req, res) {

  const itemId = req.body.itemId;
  const listName = req.body.list;

  if (listName === today) {

    Item.findByIdAndDelete(itemId, function(err) {
      if (err) console.log(err);
    });

    res.redirect('/');

  } else {

    List.findOneAndUpdate({name: listName}, {$pull: {"items": {"_id": itemId}}}, function(err) {
      if (err) console.log(err);
    });

    res.redirect('/' + listName);
  }
});





app.listen(3000, function() {
  console.log('Server is running on localhost:3000');
});
