"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Camera } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Profile() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    // Remove local storage items
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    
    // Create and dispatch the logout event
    const logoutEvent = new CustomEvent('user-logout', {
      detail: { timestamp: Date.now() }
    });
    
    // Use setTimeout to ensure event is processed before navigation
    window.dispatchEvent(logoutEvent);
    
    // Small delay to ensure state updates complete
    setTimeout(() => {
      router.push("/");
    }, 100);
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
      
      // Dispatch event before toast to ensure immediate update
      window.dispatchEvent(new Event('avatar-update'));
      
      toast.success("Cập nhật thông tin thành công!");
      setDisplayedName(fullName);
    } catch (err) {
      console.error("Lỗi khi cập nhật thông tin:", err);
      toast.error("Đã xảy ra lỗi khi cập nhật.");
    }
  };

  // When file is selected for avatar
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatarUrl(base64);
      };
      reader.readAsDataURL(file);
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
          <p className="text-black font-semibold uppercase text-lg tracking-wide hover:text-blue-600 cursor-pointer">
            Đơn hàng đã mua
          </p>
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
      <div className="w-full md:w-3/4 bg-white p-6 rounded-lg shadow space-y-7 relative">
        {/* Avatar */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          id="avatar-upload"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex justify-center relative">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Avatar className="h-40 w-40 border-2 border-gray-300">
                    <AvatarImage src={avatarUrl || "https://github.com/shadcn.png"} />
                    <AvatarFallback>NA</AvatarFallback>
                  </Avatar>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Camera className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Nhấp vào icon để thay đổi ảnh đại diện</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Display Name */}
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

        {/* Address */}
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

        {/* Phone */}
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
