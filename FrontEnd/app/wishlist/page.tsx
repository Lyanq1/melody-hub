"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface WishlistItem {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
}

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("wishlist");
    if (stored) {
      setWishlist(JSON.parse(stored));
    }
  }, []);

  const removeFromWishlist = (id: string) => {
    const updated = wishlist.filter((item) => item.id !== id);
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">MY WISHLIST</h1>

      {wishlist.length === 0 ? (
        <Card>
          <CardContent className="text-center py-6 text-gray-500">
            Wishlist của bạn hiện trống.
          </CardContent>
        </Card>
      ) : (
        <Card>
              <CardHeader>
                <CardTitle>PRODUCT NAME</CardTitle>
              </CardHeader>
              <Separator className="my-4" /> {/* Thêm Separator ở trên cùng */}
              <CardContent className="space-y-4">
                {wishlist.map((item, index) => (
                  <div key={item.id}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.price}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFromWishlist(item.id)}
                      >
                        Xóa
                      </Button>
                    </div>
                    {index < wishlist.length - 1 && <Separator className="my-4" />} {/* Giữ nguyên Separator giữa các sản phẩm */}
                  </div>
                ))}
              </CardContent>
            </Card>


      )}
    </div>
  );
};

export default WishlistPage;
