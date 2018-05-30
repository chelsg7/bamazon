var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");
var command = process.argv[2];


var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon_DB"
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("Connected as id: " + connection.threadId);
  runApp();
});
var runApp = function () {
  connection.query('SELECT * FROM products', function (err, res) {
    var table = new Table({
      head: ["item_id", "item_name", "department", "stock", "price"],
    });
    for (var i = 0; i < res.length; i++) {
      var productArray = [res[i].item_id, res[i].item_name, res[i].department, res[i].stock, res[i].price];
      table.push(productArray);
    }
    console.log(table.toString());
    managerView();
  });
};

var managerView = function () {
  inquirer
    .prompt([{
      type: "list",
      message: "What would you like to do?",
      choices: ["1 - View Low Stock Items", "2 - Restock Existing Item", "3 - Add New Item"],
      name: "query"
    }, ])
    .then(function (inquirerResponse) {
      if (inquirerResponse.query == "1 - View Low Stock Items") {
        console.log(inquirerResponse.query);
        lowInventory();
      } else if (inquirerResponse.query == "2 - Restock Existing Item") {
        restockInventory();
      } else if (inquirerResponse.query == "3 - Add New Item") {
        addNewProduct();
      }
    });
}

var lowInventory = function () {
  connection.query("SELECT * from products", function (err, res) {
    var table = new Table({
      head: ["item_id", "item_name", "department", "stock", "price"],
    });
    for (var i = 0; i < res.length; i++) {
      if (res[i].stock < 10) {
        var productArray = [res[i].item_id, res[i].item_name, res[i].department, res[i].stock, res[i].price];
        table.push(productArray);
      }
    }
    console.log(table.toString());
    managerView();
  });
}

var addNewProduct = function (){
  inquirer.prompt([
    {
      type: "list",
      message: "What is the type of the product you wish to add?",
      choices: ["Pet Supplies", "Health & Beauty", "Recreation", "Clothing"],
      name: "departmentInput"
    },
    {
      type: "input",
      message: "What is the name of the item?",
      name: "item_name"
    },
    {
      type: "input",
      message: "How many should be stocked?",
      name: "stockInput"
    },
    {
      type: "input",
      message: "How much is the item?",
      name: "priceInput"
    },
    {
      type: "confirm",
      message: "Are you sure?",
      name: "confirm",
      default: true
    }

  ])
  .then(function (inquirerResponse) {
    if( inquirerResponse.confirm == true){
      addProductInquirer(inquirerResponse.item_name, inquirerResponse.departmentInput, inquirerResponse.stockInput, inquirerResponse.priceInput);
      } else {
        runApp();
      }
  });

}
var addProductInquirer = function ( item_name, departmentInput, stockInput, priceInput) {
  
  var query = connection.query(
    "INSERT INTO products SET ?", {
      item_name: item_name,
      department: departmentInput,
      stock: stockInput,
      price: priceInput,
    },
    function (err, res) {
      if (err) throw err;
    }
  );
  runApp();
}

var restockInventory = function () {
  inquirer
    .prompt([{
        type: "input",
        message: "What is the item_id of the Product you want to restock?",
        name: "add_item_id"
      },
      {
        type: "input",
        message: "How much would you like to stock?",
        name: "add_stock"
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
        var add_item_id = inquirerResponse.add_item_id;
        connection.query("SELECT * from products where ?",{
          item_id : add_item_id
        }, function (err, res) {
          // var add_item_id = inquirerResponse.add_item_id;
          var newitem_id = parseInt(add_item_id) - 1;
          var addInventory = inquirerResponse.add_stock;
          var availAmount = res[0].stock;
          if (addInventory <= 0) {
            console.log("You Didn't Add Any Stock.")
          } else {
            console.log("Added " + addInventory + "to " + res[0].item_name +"'s inventory.");
            var updatedAmount = parseInt(availAmount) + parseInt(addInventory);

            connection.query("UPDATE products SET ? WHERE ?", [{
              stock: updatedAmount
            }, {
              item_id: add_item_id
            }], function (err, res) {
              if (err) throw err;
            });
            runApp();
          }
        });
      } else {
        runApp();
      }
    });
}
