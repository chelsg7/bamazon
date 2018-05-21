var mysql = require("mysql");
var Table=require("cli-table");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon_DB"
});

var productPurchased = [];

connection.connect(function(error){
    if(error){
        console.log(error);
    }else{
        console.log('Connected ' + connection.threadId);
        startRun();
        // purchase();
    }
});

var startRun = function (){
    //connect to the mysql database and pull the information from the Products database to display to the user
    connection.query('SELECT item_id, item_name, price, stock FROM products', function(err, result){
        if(err) console.log(err);
        //creates a table for the information from the mysql database to be placed
        var table = new Table({
            head: ['item+id', 'item_name', 'stock', 'price']
        });
        //loops through each item in the mysql database and pushes that information into a new row in the table
        for(var i = 0; i < result.length; i++){
            table.push(
                [result[i].item_id, result[i].item_name, result[i].stock, result[i].price]
            );
        }
        console.log(table.toString());
        purchase();
    });
};
var purchase = function(){
    inquirer.prompt([
        {
            name: "buyItem",
            type: "confirm",
            message: "Do you want to buy something?"
        }
    ]).then(function(answer){
        if (answer.buyItem){
            userInput();
        } else {
            console.log("Later!");
            process.exit();
        };
    });
};

var userInput = function(){
    inquirer.prompt([
    {
        name: "toBuy",
        type: "input",
        message: "Enter item id of the product you would like to buy.",
    },
    {
        name: "quantity",
        type: "input",
        message: "How many would you like to buy?"
    }
    ]).then(function(answer){
        var query = "SELECT * FROM products";
        connection.query(query, function(err, res){
            for (var i=0; i<res.length; i++){
                if (res[i].item_id == answer.toBuy){
                    var stock = res[i].stock_quantity;
                    var requested = parseInt(answer.quantity);
                    if (stock < requested){
                        console.log("Sorry, we do not have enough items in stock.");
                        userInput();
                    }else{
                        var newStock = stock - requested;
                        updateStock(newStock, res[i].item_id);
                    }
                }
            }
        });
    });
};

function updateStock(initialStock, givenItem){
    var query = connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: initialStock
            },
            {
                item_id: givenItem
            }
        ],
        function(err, res){
            // initializeApp();
            console.log("it's on the way!")
            // startRun();
            purchase();
        }
    );
}