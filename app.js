//jshint esversion:6

import express from "express";
import bd from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";

const app = express();

app.set('view engine', 'ejs');

app.use(bd.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://scram:hatif15@atlascluster.prqvaaa.mongodb.net/todolistDB');
}

const itemSchema = new mongoose.Schema({
  item: String
});
const Item = mongoose.model('Item', itemSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});
const List = mongoose.model('List', listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    res.render("list", {newListItems: foundItems, title: "Today"});
  });
});
app.post("/", function(req, res){
  const item = new Item( {item: req.body.newItem});
  const listName = _.trim(_.capitalize(req.body.list));
  
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name: listName}, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
  
});


app.post("/delete", function(req, res){
  const checkedItem = req.body.checkbox;
  const listName = _.trim(_.capitalize(req.body.listName));
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItem, function(err){
      if(!err){
        console.log("No error");
        res.redirect("/");
      }
    });
  } else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
  
});


app.get("/:customListName", function (req, res) {
  const customListName = _.trim(_.capitalize(req.params.customListName));
  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName
        });
        list.save();
        res.redirect("/"+customListName);
      } else{
        res.render("list", {newListItems: foundList.items, title: customListName})
      }
    }
  });
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
