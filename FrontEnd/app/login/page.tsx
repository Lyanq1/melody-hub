"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./login.css";
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role] = useState("Customer");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.FB) {
      const script = document.createElement("script");
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        if (window.FB) {
          window.fbAsyncInit = function () {
            window.FB.init({
              appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "",
              cookie: true,
              xfbml: true,
              version: "v23.0",
            });
          };
          window.FB.XFBML.parse();
          console.log("Facebook SDK loaded successfully");
        }
      };
      document.body.appendChild(script);
    } else if (window.FB) {
      window.FB.XFBML.parse();
      console.log("Facebook SDK already loaded");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://melody-hub-vhml.onrender.com/api/auth/login",
        { username, password }
      );
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("isLoggedIn", "true"); // Đặt trạng thái đăng nhập
      window.dispatchEvent(new Event("storage")); // Gửi sự kiện để cập nhật Navbar
      alert(`Login successful! Welcome, ${user.displayName}`);
      window.location.href = "/";
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Login failed");
      } else if (err instanceof Error) {
        setError(err.message || "Login failed");
      } else {
        setError("Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    setIsLoading(true);
    setError("");

    if (typeof window !== "undefined" && window.FB && window.location.protocol === "https:") {
      window.FB.login(
        (response: any) => {
          if (response.authResponse) {
            const accessToken = response.authResponse.accessToken;
            console.log("Access token received:", accessToken);

            axios
              .get(
                `https://graph.facebook.com/me?fields=id,email,name,gender,birthday,age_range,location,hometown&access_token=${accessToken}`
              )
              .then((response) => {
                if (response.data) {
                  localStorage.setItem("facebookUser", JSON.stringify(response.data));
                }
                console.log(response.data);
              })
              .catch((err) => {
                console.error("Error fetching Facebook user data:", err);
              });

            axios
              .post("https://melody-hub-vhml.onrender.com/api/auth/facebook", { accessToken, role })
              .then((res) => {
                const { token, user } = res.data;
                localStorage.setItem("token", token);
                localStorage.setItem("isLoggedIn", "true"); // Đặt trạng thái đăng nhập
                window.dispatchEvent(new Event("storage")); // Gửi sự kiện để cập nhật Navbar
                alert(`Facebook login successful! Welcome, ${user.displayName}`);
                window.location.href = "/";
              })
              .catch((err) => {
                console.error("Facebook login error:", err.response?.data || err.message);
                setError(err.response?.data?.message || "Facebook login failed");
              })
              .finally(() => setIsLoading(false));
          } else {
            setError("User cancelled login or did not authorize");
            setIsLoading(false);
          }
        },
        { scope: "email,public_profile" }
      );
    } else {
      setError("Facebook login requires HTTPS or SDK not loaded");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-64px)] bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: `url('')`, // Thay bằng hình nền phù hợp
      }}
    >
      <div className="wrapper">
        <h1 style={{ fontFamily: "Tangkiwood" }}>ACCOUNT LOGIN</h1>
        <form onSubmit={handleLogin}>
          <div className="input-box">
            <input
              style={{ fontFamily: "MicaValo" }}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              required
            />
          </div>
          <div className="input-box">
            <input
              style={{ fontFamily: "MicaValo" }}
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            style={{ fontFamily: "Tangkiwood", fontSize: "20px" }}
            disabled={isLoading}
            className="btn"
          >
            {isLoading ? "Logging in..." : "LOGIN"}
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>

        <button
          onClick={handleFacebookLogin}
          disabled={isLoading}
          style={{ fontFamily: "Tangkiwood", fontSize: "20px" }}
          className="btn"
        >
          {isLoading ? "Logging in with Facebook..." : "FACEBOOK"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;