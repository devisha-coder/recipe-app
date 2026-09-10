import { useState } from "react";
import axios from "axios";
import "./Login.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "https://recipe-app-q8bi.onrender.com/api/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userName", res.data.user.name);
      localStorage.setItem("userId", res.data.user.id);
      onLogin();

    } catch (error) {
  console.log("LOGIN ERROR:", error);
  console.log("STATUS:", error.response?.status);
  console.log("DATA:", error.response?.data);

  alert(
    error.response?.data?.message ||
    error.message ||
    "Login failed"
  );
}
  };
    const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "https://recipe-app-q8bi.onrender.com/api/auth/register",
        {
          name,
          email,
          password,
        }
      );

      alert("Registration successful! Please login.");

      setIsRegistering(false);
      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
  <div className="login-page">
    <div className="login-card">

      <div className="login-logo">
        🍳
      </div>

      <h1>Recipe Hub</h1>

      <p className="login-tagline">
        Delicious ideas, made simple ✨
      </p>

      {isRegistering ? (
  <>
    <h2>Create Account ✨</h2>

    <p className="login-subtitle">
      Join Recipe Hub and start creating!
    </p>
  </>
) : (
  <>
    <h2>Welcome Back! 👋</h2>

    <p className="login-subtitle">
      Login to manage your recipes
    </p>
  </>
)}

      <form onSubmit={isRegistering ? handleRegister : handleLogin}>
        {isRegistering && (
  <div className="input-group">
    <label>Name</label>

    <input
      type="text"
      placeholder="Enter your name"
      value={name}
      onChange={(e) => setName(e.target.value)}
      required
    />
  </div>
)}

        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="login-btn">
  {isRegistering ? "Create Account ✨" : "Login 🔐"}
</button>

      </form>
      <p className="switch-auth">
  {isRegistering
    ? "Already have an account?"
    : "Don't have an account?"}

  <button
    type="button"
    onClick={() => setIsRegistering(!isRegistering)}
  >
    {isRegistering ? " Login" : " Register"}
  </button>
</p>

      <p className="login-footer">
        Cook • Create • Share ❤️
      </p>

    </div>
  </div>
);
}

export default Login;