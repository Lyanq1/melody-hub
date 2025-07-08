'use client'

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { LayoutDashboard, Disc, ShoppingCart, Users, Percent } from "lucide-react";

const salesData = [
  { month: "Jan", sales: 1200 },
  { month: "Feb", sales: 2100 },
  { month: "Mar", sales: 800 },
  { month: "Apr", sales: 1600 },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">📀 Vinyl Records Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <LayoutDashboard className="w-8 h-8 text-indigo-500" />
            <div>
              <p className="text-sm text-gray-500">Doanh thu tháng</p>
              <p className="text-xl font-bold">35,000,000₫</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <ShoppingCart className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Đơn hàng hôm nay</p>
              <p className="text-xl font-bold">57</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <Disc className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-500">Đĩa than còn lại</p>
              <p className="text-xl font-bold">120</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <Users className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Khách hàng mới</p>
              <p className="text-xl font-bold">12</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">📊 Doanh thu theo tháng</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData}>
            <XAxis dataKey="month" stroke="#8884d8" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#8884d8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-end">
        <Button className="bg-black text-white hover:bg-gray-800">Xem chi tiết đơn hàng</Button>
      </div>
    </div>
  );
}
