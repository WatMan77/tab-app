import { TextField, Button } from "@mui/material";
import { useState } from "react";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
      console.log(response);
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <>
      <TextField
        label="Enter username"
        variant="outlined"
        onChange={({ target }) => setUsername(target.value)}
      />
      <TextField
        label="Enter password"
        variant="outlined"
        onChange={({ target }) => setPassword(target.value)}
      />
      <Button onClick={logIn}>Log in</Button>
    </>
  );
};

export default AdminLogin;
