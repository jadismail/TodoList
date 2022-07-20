const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static("public"));

const today = new Date();
let currentDay = today.getDay();
const options = { weekday: "long", month: "long", day: "numeric" };
let day = today.toLocaleDateString("en-US", options);

mongoose.connect(
    "mongodb+srv://admin-jad:Azaz0909@cluster0.regbn.mongodb.net/todolistDB"
);
const itemsSchema = {
    name: String,
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
    name: "Study Graphic design",
});
const item2 = new Item({
    name: "study computer science",
});
const item3 = new Item({
    name: "study database",
});
const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema],
};
const List = mongoose.model("list", listSchema);

app.get("/", (req, res) => {
    Item.find({}, (err, result) => {
        if (result.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("successfully inserted");
                }
            });
            res.redirect("/");
        }
        res.render("list", { kindOfDay: day, newLists: result });
    });
});

app.get("/:customListName", (req, res) => {
    const customListName = req.params.customListName;

    List.findOne({ name: customListName }, (err, result) => {
        if (!err) {
            if (!result) {
                const list = new List({
                    name: customListName,
                    items: defaultItems,
                });
                list.save();
                res.redirect(`/${customListName}`);
            } else {
                res.render("list", { kindOfDay: result.name, newLists: result.items });
            }
        }
    });
});

app.post("/", (req, res) => {
    let newItem = req.body.NewTask;
    const listName = req.body.list;

    const item = new Item({
        name: newItem,
    });
    item.save();
    res.redirect("/");
});

app.post("/delete", (req, res) => {
    const checkedItemID = req.body.checkbox;
    Item.findByIdAndRemove(checkedItemID, (err) => {
        if (!err) {
            console.log("successfully removed");
            res.redirect("/");
        }
    });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("server running on port " + PORT);
});