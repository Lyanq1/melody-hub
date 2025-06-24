"use client";

import { useState } from "react";

const WishlistPage = () => {
  // Giả lập danh sách sản phẩm trong wishlist (có thể thay bằng API sau)
  const [wishlist, setWishlist] = useState([
    { id: 1, name: "Vinyl Record - Classic Hits", price: "$20.00" },
    { id: 2, name: "Echo Headphones", price: "$50.00" },
  ]);

  // Hàm xóa sản phẩm khỏi wishlist
  const removeFromWishlist = (id: number) => {
    setWishlist(wishlist.filter((item) => item.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        My Wishlist
      </h1>

      {wishlist.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6 text-center">
          <p className="text-gray-500">Wishlist của bạn hiện trống.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b py-4 last:border-b-0"
            >
              <div>
                <h3 className="text-lg font-medium">{item.name}</h3>
                <p className="text-gray-600">{item.price}</p>
              </div>
              <button
                onClick={() => removeFromWishlist(item.id)}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;