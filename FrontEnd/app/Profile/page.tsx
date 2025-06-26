"use client"

import { useEffect, useState } from "react"
import { Tab } from "@headlessui/react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { UserCircle } from "lucide-react"

const ProfilePage = () => {
  const [selectedTab, setSelectedTab] = useState(0)
  const [fullName, setFullName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [displayedName, setDisplayedName] = useState("Chưa có tên");
  // Lấy email từ localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail")
    const storedName = localStorage.getItem("userDisplayName");
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      setEmail("example@email.com")
    }
    if (storedName) {
    setDisplayedName(storedName); 
    setFullName(storedName);    
    }
  }, [])

  const handleSave = () => {
    // TODO: Có thể gửi lên server tại đây
    setDisplayedName(fullName);
    localStorage.setItem("userDisplayName", fullName);
    alert("Thông tin đã được lưu!")

  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-600">
        Trang Cá Nhân
      </h1>

      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <div className="flex justify-center mb-8 gap-4 border-b border-gray-200">
          {["Thông tin tài khoản", "Đơn hàng đã mua"].map((tab, index) => (
            <Tab
              key={index}
              className={({ selected }) =>
                `px-4 py-2 font-semibold text-sm sm:text-base focus:outline-none transition-all ${
                  selected
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`
              }
            >
              {tab}
            </Tab>
          ))}
        </div>

        <Tab.Panels>
          <Tab.Panel>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl text-blue-600 text-center">
                  Thông tin tài khoản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-md">
                    <UserCircle className="w-12 h-12" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">
                      {displayedName}
                    </p>
                    <p className="text-muted-foreground">{email}</p>
                  </div>
                </div>

                {/* Editable fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Họ và tên</Label>
                    <Input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nhập họ và tên"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={email}
                      type="email"
                      disabled
                      className="mt-2"
                      
                    />
                  </div>
                  <div>
                    <Label>Địa chỉ giao hàng</Label>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Nhập địa chỉ"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Số điện thoại</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Nhập số điện thoại"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button variant="outline" onClick={() => alert("Đăng xuất thành công!")}>
                    Đăng xuất
                  </Button>
                  <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                    Lưu thay đổi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Tab.Panel>

          <Tab.Panel>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl text-blue-600 text-center">
                  Đơn hàng đã mua
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Chưa có dữ liệu đơn hàng.</p>
              </CardContent>
            </Card>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}

export default ProfilePage
