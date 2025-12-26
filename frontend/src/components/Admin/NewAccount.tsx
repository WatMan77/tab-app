import {
  TextField,
  Button,
} from "@mui/material";
import { useState } from "react";
import CurrencyInput from "react-currency-input-field";
import axios from 'axios';
import { toast } from "react-toastify";

const NewUser: React.FC<{ fetchUsers: () => void }> = ({ fetchUsers }) => {
  const [username, setUsername] = useState("");
  const [balance, setBalance] = useState(0);

  const userInfo = window.localStorage.getItem("loggedPiikkiAdmin");

  const handleBalance = (amount: number): void => {
    if (!amount) {
      setBalance(0);
      return;
    }

    setBalance(amount * 100);
  };

  const handleNewUser = async () => {
    if (!userInfo && JSON.parse(userInfo!).token) {
      return;
    }
    const token = JSON.parse(userInfo!).token;
    const requestOptions = {
      headers: { "Content-Type": "application/json", "Authorization": token }
    };
    const body = {
      username,
      balance: Math.floor(balance), // Without this could casue some issues with decimals
      pincode: null,
      unlocked_until: null
    };
    try {
      await axios.post("/api/account", body, requestOptions);
      fetchUsers();
      setBalance(0);
      setUsername("");
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const message = e?.response?.data && e.response.data !== "" ?
          e.response.data : e.message;
        toast.error("Couldn't create new user: " + message)
      } else if (e instanceof Error) {
        toast.error(e.message)
      } else {
        toast.error("Unexpected error")
      }
    }
  };

  return (
    <div className="box-container">
      <TextField
        label="Enter account name"
        value={username}
        onChange={({ target }) => setUsername(target.value)}
      />
      <CurrencyInput
        placeholder="Enter a value"
        onValueChange={(_value, _name, values) => {
          if (values!.float) {
            handleBalance(Number.parseFloat(values!.float!.toFixed(2)));
          } else {
            handleBalance(0);
          }
        }}
        decimalSeparator=","
        groupSeparator=" "
      />
      <Button variant="contained" onClick={handleNewUser}>
        Create user
      </Button>
    </div>
  );
};

export default NewUser;
