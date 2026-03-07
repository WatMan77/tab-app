import { TextField, Button } from "@mui/material";
import { useState } from "react";
import "../../styling/login.scss";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


const CreateAdmin = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const createAdmin = async () => {
        const body = {
            username,
            password
        }
        const requestOptions = {
            headers: { "Content-Type": "application/json" },
        };
        try {
            await axios.post("/api/admin", body, requestOptions);
            navigate("/")

        } catch (e) {
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

    }

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
                    <Button onClick={createAdmin} variant="contained">
                        Log in
                    </Button>
                </div>
            </div>
        </>
    );

}


export default CreateAdmin