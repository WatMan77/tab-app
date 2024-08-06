import { TextField, Button } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styling/login.scss";
import logo from "../../assets/joutomiehet_white.svg";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const logIn = async () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
      }),
    };

    try {
      const response = await fetch("/api/login", requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      const token = `Bearer ${data.token}`;
      window.localStorage.setItem(
        "loggedPiikkiAdmin",
        JSON.stringify({ username, token })
      );
      navigate("/");
    } catch (e) {
      console.log("LOGIN FAILED!");
      console.log(e);
    }
  };
  return (
    <>
      <div className="login-container">
        <img src={logo} alt="" />
        <div className="login">
          <TextField
            label="Enter username"
            variant="outlined"
            onChange={({ target }) => setUsername(target.value)}
          />
          <TextField
            label="Enter password"
            variant="outlined"
            type="password"
            onChange={({ target }) => setPassword(target.value)}
          />
          <Button onClick={logIn} variant="contained">
            Log in
          </Button>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
