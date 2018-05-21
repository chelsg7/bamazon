DROP DATABASE IF EXISTS bamazon_DB;

CREATE DATABASE bamazon_DB;

USE bamazon_DB;

CREATE TABLE products (
    item_id INT NOT NULL AUTO_INCREMENT,
    item_name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    price DECIMAL(10,2),
    stock INTEGER(10),
    PRIMARY KEY (item_id)
);

-- INSERT INTO products(item_name , department, price, stock)
-- VALUES
-- 	("Dog Leash", "Pet Supplies", 15.27, 20),
-- 	("Dog Food", "Pet Supplies", 50.50, 50),
-- 	("Squeaky Toy", "Pet Supplies", 5.31, 20),
-- 	("Band-Aids", "Health & Beauty", 3.77, 100),
-- 	("Sunscreen", "Health & Beauty", 12.24, 45),
-- 	("Toothbrush", "Health & Beauty", 1.20, 20),
-- 	("Chapstick", "Health & Beauty", 2.50, 75),
-- 	("Running Shoes", "Recreation" , 131.07, 15),
-- 	("XL Tent", "Recreation", 227.71, 10),
-- 	("Water Purifier", "Recreation" , 90.17, 20);

