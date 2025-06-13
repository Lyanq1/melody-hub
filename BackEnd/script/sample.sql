CREATE DATABASE IF NOT EXISTS MelodyHub;
USE MelodyHub;

-- Bảng Artist
CREATE TABLE Artist (
    ArtistID INT PRIMARY KEY,
    Name VARCHAR(100),
    Phone VARCHAR(20),
    Email VARCHAR(100),
    Address VARCHAR(255)
);

-- Bảng Account
CREATE TABLE Account (
    AccountID INT PRIMARY KEY,
    username VARCHAR(100),
    Password VARCHAR(100),
    UserType VARCHAR(50)
);

-- Bảng Customer
CREATE TABLE Customer (
    CustomerID INT PRIMARY KEY,
    Name VARCHAR(100),
    Phone VARCHAR(20),
    Email VARCHAR(100),
    Address VARCHAR(255)
);

-- Bảng Disc
CREATE TABLE Disc (
    DiscID INT PRIMARY KEY,
    Title VARCHAR(100),
    Genre VARCHAR(50),
    Price DECIMAL(10,2),
    StockQuantity INT,
    Description TEXT,
    ImageURL VARCHAR(255)
);

-- Bảng Song
CREATE TABLE Song (
    SongID INT PRIMARY KEY,
    SongName VARCHAR(100),
    FileURL VARCHAR(255),
    DiscID INT,
    FOREIGN KEY (DiscID) REFERENCES Disc(DiscID)
);

-- Bảng Cart
CREATE TABLE Cart (
    CartID INT PRIMARY KEY,
    CustomerID INT,
    IsActive BOOLEAN,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
);

-- Bảng CartItem
CREATE TABLE CartItem (
    CartID INT,
    DiscID INT,
    Quantity INT,
    Price DECIMAL(10,2),
    PRIMARY KEY (CartID, DiscID),
    FOREIGN KEY (CartID) REFERENCES Cart(CartID),
    FOREIGN KEY (DiscID) REFERENCES Disc(DiscID)
);

-- Bảng Order
CREATE TABLE `Order` (
    OrderID INT PRIMARY KEY,
    CustomerID INT,
    OrderDate DATE,
    Status VARCHAR(50),
    TotalAmount DECIMAL(10,2),
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
);

-- Bảng OrderDetail
CREATE TABLE OrderDetail (
    OrderID INT,
    DiscID INT,
    Quantity INT,
    UnitPrice DECIMAL(10,2),
    PRIMARY KEY (OrderID, DiscID),
    FOREIGN KEY (OrderID) REFERENCES `Order`(OrderID),
    FOREIGN KEY (DiscID) REFERENCES Disc(DiscID)
);

-- Bảng Payment
CREATE TABLE Payment (
    PaymentID INT PRIMARY KEY,
    OrderID INT,
    PaymentMethod VARCHAR(50),
    PaymentStatus VARCHAR(50),
    PaymentDate DATE,
    TotalAmount DECIMAL(10,2),
    FOREIGN KEY (OrderID) REFERENCES `Order`(OrderID)
);



-- ARTIST
INSERT INTO Artist VALUES
(1, 'IU', '0123456789', 'iu@example.com', 'Seoul, Korea'),
(2, 'Taylor Swift', '0987654321', 'taylor@example.com', 'Nashville, USA');

-- ACCOUNT
INSERT INTO Account VALUES
(1,'user1', '123', 'admin'),
(2,'user2' '123', 'customer');

-- CUSTOMER
INSERT INTO Customer VALUES
(1, 'Minh Anh', '0911111111', 'ma@gmail.com', 'Hanoi'),
(2, 'John Smith', '0922222222', 'john@gmail.com', 'New York');

-- DISC
INSERT INTO Disc VALUES
(1, 'Palette', 'K-Pop', 10.99, 100, 'Album của IU phát hành 2017', 'iu_palette.jpg'),
(2, '1989', 'Pop', 12.99, 150, 'Taylor Swift Album', '1989.jpg');

-- SONG
INSERT INTO Song VALUES
(1, 'Palette', 'palette.mp3', 1),
(2, 'Through the Night', 'night.mp3', 1),
(3, 'Blank Space', 'blankspace.mp3', 2),
(4, 'Style', 'style.mp3', 2);

-- CART
INSERT INTO Cart VALUES
(1, 1, TRUE),
(2, 2, FALSE);

-- CARTITEM
INSERT INTO CartItem VALUES
(1, 1, 2, 10.99),
(1, 2, 1, 12.99),
(2, 2, 1, 12.99);

-- ORDER
INSERT INTO `Order` VALUES
(1, 1, '2025-06-01', 'Completed', 34.97),
(2, 2, '2025-06-03', 'Pending', 12.99);

-- ORDERDETAIL
INSERT INTO OrderDetail VALUES
(1, 1, 2, 10.99),
(1, 2, 1, 12.99),
(2, 2, 1, 12.99);

-- PAYMENT
INSERT INTO Payment VALUES
(1, 1, 'Credit Card', 'Paid', '2025-06-01', 34.97),
(2, 2, 'Paypal', 'Unpaid', NULL, 12.99);

