DROP DATABASE IF EXISTS MelodyHub;
CREATE DATABASE MelodyHub;

USE MelodyHub;

SELECT * FROM ACCOUNT;

SELECT * FROM Customer;

-- Bảng Account: Dùng chung cho đăng ký & xác thực, thêm trường Role
CREATE TABLE Account (
    AccountID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(100),
    Email VARCHAR(100) NOT NULL,
    DisplayName VARCHAR(100) NOT NULL,
    AvatarURL VARCHAR(255),
    Role ENUM('Customer', 'Artist', 'Admin') NOT NULL DEFAULT 'Customer',
	IsVerified TINYINT(1) DEFAULT 0,

    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Customer: Thông tin riêng của người dùng Customer
CREATE TABLE Customer (
    CustomerID INT PRIMARY KEY AUTO_INCREMENT,
    AccountID INT NOT NULL,
    Phone VARCHAR(20),
    Address VARCHAR(255),
    FOREIGN KEY (AccountID) REFERENCES Account(AccountID) ON DELETE CASCADE
);

-- Bảng Artist
CREATE TABLE Artist (
    ArtistID INT PRIMARY KEY AUTO_INCREMENT,
    AccountID INT NOT NULL,
    Phone VARCHAR(20),
    Address VARCHAR(255),
    FOREIGN KEY (AccountID) REFERENCES Account(AccountID) ON DELETE CASCADE
);

-- Bảng Admin
CREATE TABLE Admin (
    AdminID INT PRIMARY KEY AUTO_INCREMENT,
    AccountID INT NOT NULL,
    Phone VARCHAR(20),
    Address VARCHAR(255),
    FOREIGN KEY (AccountID) REFERENCES Account(AccountID) ON DELETE CASCADE
);

-- Bảng Disc (album)
CREATE TABLE Disc (
    DiscID INT PRIMARY KEY AUTO_INCREMENT,
    Title VARCHAR(100),
    Genre VARCHAR(50),
    Price DECIMAL(10,2),
    StockQuantity INT,
    Description TEXT,
    ImageURL VARCHAR(255)
);

-- Bảng Song
CREATE TABLE Song (
    SongID INT PRIMARY KEY AUTO_INCREMENT,
    SongName VARCHAR(100),
    FileURL VARCHAR(255),
    DiscID INT,
    FOREIGN KEY (DiscID) REFERENCES Disc(DiscID)
);

-- Bảng Cart
CREATE TABLE Cart (
    CartID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
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
    OrderID INT PRIMARY KEY AUTO_INCREMENT,
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
    PaymentID INT PRIMARY KEY AUTO_INCREMENT,
    OrderID INT,
    PaymentMethod VARCHAR(50),
    PaymentStatus VARCHAR(50),
    PaymentDate DATE,
    TotalAmount DECIMAL(10,2),
    FOREIGN KEY (OrderID) REFERENCES `Order`(OrderID)
);

-- Bảng Favorite (sản phẩm yêu thích)
CREATE TABLE Favorite (
    CustomerID INT,
    DiscID INT,
    PRIMARY KEY (CustomerID, DiscID),
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID),
    FOREIGN KEY (DiscID) REFERENCES Disc(DiscID)
);