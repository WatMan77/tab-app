import { TextField, Button } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styling/login.scss";
import axios from 'axios';
import { toast } from "react-toastify";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const logIn = async () => {
    const requestOptions = {
      headers: { "Content-Type": "application/json" },
    };

    const body = {
      username,
      password,
    };

    try {
      const response = await axios.post("/api/login/", body, requestOptions);

      const token = `Bearer ${response.data.token}`;
      window.localStorage.setItem(
        "loggedPiikkiAdmin",
        JSON.stringify({ username, token })
      );
      navigate("/");
    } catch (e: unknown) {
      console.log("LOGIN FAILED!");
      if (axios.isAxiosError(e)) {
        const message = e?.response?.data && e.response.data !== "" ?
          e.response.data : e.message;
        toast.error("Login failed: " + message)
      } else if (e instanceof Error) {
        toast.error(e.message)
      } else {
        toast.error("Unexpected error")
      }
      console.log(e);
    }
  };
  return (
    <>
      <div className="login-container">
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
