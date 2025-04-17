import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./register.scss";
import axios from "axios";
import Header from "../home/components/header";

const Register = () => {
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [inputVerificationCode, setInputVerificationCode] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: any) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleVerificationCodeChange = (e: any) => {
    setInputVerificationCode(e.target.value);
  };

  const sendVerificationCode = async () => {
    if (!inputs.email) {
      setErr("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inputs.email)) {
      setErr("Please enter a valid email address");
      return;
    }

    try {
      setErr(null);
      // 生成6位随机验证码
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      setVerificationCode(generatedCode);
      
      console.log('Sending verification code...');
      // 发送验证码到用户邮箱
      const response = await axios.post("http://localhost:10000/user/send-verification", {
        email: inputs.email,
        code: generatedCode
      });
      
      console.log('Verification code sent response:', response.data);
      setIsEmailSent(true);
      setErr("Verification code sent to your email");
    } catch (err: any) {
      console.error('Verification code sending error:', err);
      if (err.response) {
        // 显示详细的错误信息
        const errorMsg = err.response.data.details 
          ? `${err.response.data.error}: ${err.response.data.details}` 
          : err.response.data.error;
        setErr(errorMsg);
      } else if (err.request) {
        // 请求发送但没有收到响应
        setErr("Server did not respond, please check your network connection");
      } else {
        setErr("Failed to send verification code, please try again later");
      }
    }
  };

  const verifyCode = () => {
    if (inputVerificationCode === verificationCode) {
      setIsEmailVerified(true);
      setErr(null);
    } else {
      setErr("Verification code is incorrect, please re-enter");
    }
  };

  const handleClick = async (e: any) => {
    e.preventDefault();

    if (!isEmailVerified) {
      setErr("Please verify your email first");
      return;
    }

    try {
      const response = await axios.post("https://cs5500-group8-tourism-web-app.onrender.com/user", inputs);
      console.log("registration successful:", response.data);
      navigate("/login");
    } catch (err: any) {
      if (err.response) {
        setErr(err.response.data.error);
      } else {
        setErr("Registration failed, please try again later");
      }
    }
  };

  return (
    <div style={{ backgroundColor: "rgb(229, 151, 104)" }}>
      <Header />
      <div className="register">
        <div className="card">
          <div className="left">
            <h1>Register</h1>
            <form>
              <input
                type="text"
                placeholder="Username"
                name="username"
                onChange={handleChange}
                required
              />
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  onChange={handleChange}
                  required
                  style={{ flex: 1 }}
                  disabled={isEmailVerified}
                />
                <button 
                  type="button" 
                  onClick={sendVerificationCode}
                  className={`${isEmailVerified ? "verified" : ""}`}
                  disabled={isEmailVerified}
                  style={{ 
                    width: "auto", 
                    padding: "10px", 
                    border: "none", 
                    backgroundColor: isEmailVerified ? "#4CAF50" : "rgb(229, 151, 104)", 
                    color: "white", 
                    fontWeight: "bold", 
                    cursor: isEmailVerified ? "not-allowed" : "pointer" 
                  }}
                >
                  {isEmailVerified ? "Verified" : "Send Verification Code"}
                </button>
              </div>

              {isEmailSent && !isEmailVerified && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                  <input
                    type="text"
                    placeholder="Verification Code"
                    onChange={handleVerificationCodeChange}
                    required
                    style={{ flex: 1 }}
                  />
                  <button 
                    type="button" 
                    onClick={verifyCode}
                    style={{ 
                      width: "auto", 
                      padding: "10px", 
                      border: "none", 
                      backgroundColor: "rgb(229, 151, 104)", 
                      color: "white", 
                      fontWeight: "bold", 
                      cursor: "pointer" 
                    }}
                  >
                    Verify
                  </button>
                </div>
              )}

              <input
                type="password"
                placeholder="Password"
                name="password"
                onChange={handleChange}
                required
              />
              <input
                type="text"
                placeholder="Name"
                name="name"
                onChange={handleChange}
                required
              />

              {err && <div style={{ color: "red" }}>{err}</div>}
              {isEmailVerified && <div style={{ color: "green" }}>Email verified successfully!</div>}

              <button onClick={handleClick}>Register</button>
            </form>
          </div>
          <div className="right">
            <h1>Join Us!</h1>
            <p>
              Join us and share your interesting experiences on the journey.
            </p>
            <span>Do you have an account?</span>
            <Link to="/login">
              <button>Login</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
