import { useState } from "react";
import { Link } from "react-router-dom";
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
  const [err, setErr] = useState<string | null>(null);

  const handleChange = (e: any) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClick = async (e: any) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8000/user", inputs);
      console.log("registration successful:", response.data);
      window.location.href = "/login";
    } catch (err: any) {
      if (err.response) {
        setErr(err.response.data.error);
      } else {
        setErr("Registration failed, please try again later");
      }
    }
  };

  console.log(err);

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
              <input
                type="email"
                placeholder="Email"
                name="email"
                onChange={handleChange}
                required
              />
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
