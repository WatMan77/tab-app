import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Admin } from "../../types";
import NewUser from "./NewAccount";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<Admin>({ username: "", token: "" });
  useEffect(() => {
    const userData = window.localStorage.getItem("loggedPiikkiAdmin");
    if (!userData) {
      navigate("/");
    } else {
      const parsed = JSON.parse(userData);
      if (parsed.username && parsed.token) {
        setAdmin(parsed);
      }
    }
  }, [navigate]);
  return (
    <>
      <h1>Hi! You have reached the admin panel!</h1>
      <NewUser />
    </>
  );
};

export default AdminPanel;
