import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
      const response = await API.post("/auth/login", {
        email,
        password,
      });

      // Save JWT Token
      localStorage.setItem(
        "token",
        response.data.access_token
      );

      // Save Login Status
      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      // Save User Information
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          name: response.data.name,
          email: response.data.email,
        })
      );

      alert("Login Successful!");

      navigate("/dashboard");

    } catch (error) {
      console.error(error);

      // Wrong email or password
      alert("Invalid credentials. Please sign up first.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h1>Welcome Back</h1>

        <p>Login to continue to DocuMind AI</p>

        <form onSubmit={handleLogin}>

          <label>Email</label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            required
          />

          <label>Password</label>

          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            required
          />

          <button type="submit">
            Login
          </button>

        </form>

        <p className="auth-footer">
          New user?{" "}
          <Link to="/auth/signup">
            Sign Up First
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;