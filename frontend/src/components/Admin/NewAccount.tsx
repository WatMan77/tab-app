import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { UserType } from "../../types";
import { useState } from "react";
import CurrencyInput from "react-currency-input-field";

const NewUser: React.FC<{ fetchUsers: () => void }> = ({ fetchUsers }) => {
  const [category, setCategory] = useState("");
  const [username, setUsername] = useState("");
  const [balance, setBalance] = useState(0);
  const options = [UserType.ASUKAS, UserType.VANHA, UserType.HANGAROUND];

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
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": token },
      body: JSON.stringify({
        username,
        category,
        balance: Math.floor(balance), // Without this could casue some issues with decimals
      }),
    };
    const request = await fetch("/api/newaccount", requestOptions);
    if (request.ok) {
      fetchUsers();
      setCategory("");
      setBalance(0);
      setUsername("");
    }
  };

  return (
    <div className="box-container">
      <TextField
        label="Enter account name"
        value={username}
        onChange={({ target }) => setUsername(target.value)}
      />
      <FormControl variant="outlined" sx={{ m: 1, minWidth: 120, flexGrow: 1 }}>
        <InputLabel>User type</InputLabel>
        <Select
          label="User type"
          onChange={({ target }) => setCategory(target.value)}
          value={category}
        >
          {options.map((u) => (
            <MenuItem key={u} value={u}>
              {u}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
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
