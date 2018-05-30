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
            message: "What is the item_id of the item you would like to buy?",
            name: "item_id"
        },
        {
            type: "input",
            message: "How many would you like to buy?",
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
            var purchase_id = inquirerResponse.item_id;
            var purchaseAmount = inquirerResponse.amount;
            connection.query("SELECT * from products where ?",{
                item_id : purchase_id
            }, function (err, res) {
            
                console.log(res);
                var availAmount = res[0].stock;
                if (purchaseAmount > availAmount) {
                    console.log("Not enough of the item in stock.")
                } else {
                    console.log("Thank you!");
                    var updatedAmount = parseInt(availAmount) - parseInt(purchaseAmount);
                    connection.query("UPDATE products SET ? WHERE ?", [{
                        stock: updatedAmount
                    }, {
                        item_id: purchase_id
                    }], function (err, res) {
                        if (err) throw err;
                        connection.query("SELECT * FROM products", function (err, res) {
                            var calcPrice = res[0].price * purchaseAmount;
                            console.log("\nYour total is today is: $" + calcPrice.toFixed(2) + "!!");
                            // process.exit();
                            runApp();
                        });
                    });
                }
            });
        //inquirer confirm endin
        } 
        else {
            runApp();
        }
});
}
  