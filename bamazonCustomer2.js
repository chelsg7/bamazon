var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon_DB"
});

connection.connect(function(error){
    if(error){
        console.log(error);
    }else{
        console.log('Connected at ' + connection.threadId);
        runApp();
    }
});


var runApp = function () {
    connection.query('SELECT item_id, item_name, price, stock FROM products', function(err, result){
        if(err) console.log(err);
        // console.clear();
        var table = new Table(
            {
                head: ['item_id', 'item_name', 'stock', 'price']
            }
        );
        for(var i = 0; i < result.length; i++){
            table.push(
                [result[i].item_id, result[i].item_name, result[i].stock, result[i].price]
            );
        }
        console.log(table.toString());
        buyItem();
    });
};

var buyItem = function () {
    inquirer.prompt(
        [{
            type: "input",
            message: "What is the item_id of the item you would like to purchase?",
            name: "item_id"
        },
        {
            type: "input",
            message: "How many would you like to purchase?",
            name: "amount"
        },
        {
            type: "confirm",
            message: "Are you sure?",
            name: "confirm",
            default: true
        }
    ])
    .then(function (inquirerResponse) {
        if (inquirerResponse.confirm) {
            connection.query("SELECT * from products", function (err, res) {
                var purchase_id = inquirerResponse.item_id;
                var item_id = purchase_id - 1;
                var purchaseAmount = inquirerResponse.amount;
                var availAmount = res[item_id].stock
                if (purchaseAmount > availAmount) {
                    console.log("There are not enough items in stock")
                } else {
                    console.log("Yay! Thank you for buying!");
                    var updatedAmount = availAmount - purchaseAmount;
                    
                    connection.query("UPDATE products SET ? WHERE ?", [{
                        stock: updatedAmount
                    }, {
                        item_id: purchase_id
                    }], function (err, res) {
                        if (err) throw err;
                    });
                    
                    connection.query("SELECT * FROM products", function (err, res) {
                        var calcPrice = res[item_id].price * purchaseAmount;
                        console.log("\nYour total is today is: $" + calcPrice.toFixed(2) + " usd");
                        process.exit();
                        runApp();
                    });
                }
            });
        } else {
            runApp();
        }
    });
};