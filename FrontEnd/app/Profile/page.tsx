"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");

  const [displayedName, setDisplayedName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername || "");

    if (storedUsername) {
      axios
        .get(`http://localhost:5000/api/auth/user/${storedUsername}`)
        .then((res) => {
          const data = res.data;
          setFullName(data.DisplayName || "");
          setDisplayedName(data.DisplayName || "Chưa có tên");
          setEmail(data.Email || "");
          setPhone(data.Phone || "");
          setAddress(data.Address || "");
          setAvatarUrl(data.AvatarURL || "");

        })
        .catch((err) => {
          console.error("Lỗi khi tải thông tin người dùng:", err);
          toast.error("Lỗi khi tải thông tin người dùng.");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    router.push("/");
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/auth/user/${username}`, {
        DisplayName: fullName,
        Email: email,
        Address: address,
        Phone: phone,
        AvatarURL: avatarUrl,
      });
      toast.success("Cập nhật thông tin thành công!");
      setDisplayedName(fullName);
    } catch (err) {
      console.error("Lỗi khi cập nhật thông tin:", err);
      toast.error("Đã xảy ra lỗi khi cập nhật.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row max-w-6xl mx-auto px-4 py-10 gap-10">
      {/* Sidebar */}
    <aside className="space-y-4 text-sm font-medium w-64">
      <div className="border-b pb-2">
        <p className="text-black font-semibold uppercase text-lg tracking-wide hover:text-blue-600 cursor-pointer">
          Thông tin tài khoản
        </p>
      </div>

      <div className="border-b pb-2 cursor-pointer hover:text-blue-600">
        <p className="text-black font-semibold uppercase text-lg tracking-wide hover:text-blue-600 cursor-pointer">Đơn hàng đã mua</p>
      </div>

      <div className="border-b pb-2 cursor-pointer hover:text-red-600">
        <button
          onClick={handleLogout}
          className="text-black font-semibold uppercase text-lg tracking-wide hover:text-blue-600 cursor-pointer text-left"
        >
          Thoát
        </button>
      </div>
    </aside>




      {/* Main content */}
      <div className="w-full md:w-3/4 bg-white p-6 rounded-lg shadow space-y-7">

        {/* Avatar */}
        <input
          type="file"
          accept="image/*"
          id="avatar-upload"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              // Convert to base64 để lưu vào DB
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64 = reader.result as string;
                setAvatarUrl(base64); // Set base64 để xem trước và lưu
              };
              reader.readAsDataURL(file);
            }
          }}
        />


        <label htmlFor="avatar-upload" className="cursor-pointer">
          <div className="flex justify-center">
            <Avatar className="h-40 w-40 border-2 border-gray-300 hover:border-blue-500">
              <AvatarImage src={avatarUrl || "https://github.com/shadcn.png"} />
              <AvatarFallback>NA</AvatarFallback>
            </Avatar>
          </div>
        </label>



        {/* Tên hiển thị */}
        <div className="space-y-2">
          <Label className="text-lg font-semibold">Tên hiển thị *</Label>
          {loading ? (
            <Skeleton className="h-12 w-full rounded-md" />
          ) : (
            <Input
              className="h-12 text-lg"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label className="text-lg font-semibold">Email *</Label>
          {loading ? (
            <Skeleton className="h-12 w-full rounded-md" />
          ) : (
            <Input
              className="h-12 text-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </div>

        {/* Địa chỉ */}
        <div className="space-y-2">
          <Label className="text-lg font-semibold">Địa chỉ *</Label>
          {loading ? (
            <Skeleton className="h-12 w-full rounded-md" />
          ) : (
            <Input
              className="h-12 text-lg"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          )}
        </div>

        {/* Số điện thoại */}
        <div className="space-y-2">
          <Label className="text-lg font-semibold">Số điện thoại *</Label>
          {loading ? (
            <Skeleton className="h-12 w-full rounded-md" />
          ) : (
            <Input
              className="h-12 text-lg"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          )}
        </div>

        {/* Buttons */}
        <div className="pt-4 flex justify-end">
          <Button
            onClick={handleSave}
            className="bg-black text-white hover:bg-gray-800 font-semibold"
          >
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
}

