"use client";

import { useState } from "react";
import { Tab } from "@headlessui/react";

const ProfilePage = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = [
    "Thông tin tài khoản",
    "Đơn hàng đã mua"
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Trang cá nhân</h1>

      {/* Tabs Navigation */}
      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <div className="flex space-x-4 border-b border-gray-300 mb-6">
          {tabs.map((tab, index) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                `px-4 py-2 font-medium focus:outline-none ${
                  selected
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`
              }
            >
              {tab}
            </Tab>
          ))}
        </div>

        {/* Tabs Content */}
        <Tab.Panels>
          {/* Tab 1: Thông tin tài khoản */}
          <Tab.Panel>
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Thông tin tài khoản</h2>
              <div className="space-y-4">
                {/* Hình ảnh đại diện */}
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-500">Avatar</span>
                  </div>
                  <div>
                    <p className="font-medium">Nguyen Van A</p>
                    <p className="text-gray-600">nguyenvana@example.com</p>
                  </div>
                </div>

                {/* Thông tin khác */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      className="mt-1 p-2 w-full border rounded-md"
                      value="Nguyen Van A"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      className="mt-1 p-2 w-full border rounded-md"
                      value="nguyenvana@example.com"
                      disabled
                    />
                  </div>
                </div>

                {/* Địa chỉ giao hàng và Số điện thoại */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Địa chỉ giao hàng
                    </label>
                    <input
                      type="text"
                      className="mt-1 p-2 w-full border rounded-md"
                      placeholder="Nhập địa chỉ giao hàng"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      className="mt-1 p-2 w-full border rounded-md"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>

                {/* Nút Đăng xuất */}
                <div className="text-right mt-6">
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    onClick={() => alert("Đăng xuất thành công!")}
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          </Tab.Panel>

          {/* Tab 2: Đơn hàng đã mua */}
          <Tab.Panel>
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Đơn hàng đã mua</h2>
              <p>Chưa có dữ liệu đơn hàng.</p>
            </div>
          </Tab.Panel>

        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default ProfilePage;
