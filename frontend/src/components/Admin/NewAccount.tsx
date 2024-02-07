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

const NewUser = () => {
  const [category, setCategory] = useState("");
  const [username, setUsername] = useState("");
  const [balance, setBalance] = useState(0);
  const options = [UserType.ASUKAS, UserType.VANHA, UserType.HANGAROUND];

  const userInfo = window.localStorage.getItem("loggedPiikkiAdmin");

  const handleBalance = (amount: number): void => {
    if (!amount) {
      setBalance(0);
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
        balance,
      }),
    };
    const request = await fetch(
      "http://localhost:3000/api/newuser",
      requestOptions
    );
    if (request.ok) {
      setCategory("");
      setUsername("");
      setBalance(0);
    }
  };

  return (
    <>
      <TextField
        label="Enter account name"
        value={username}
        onChange={({ target }) => setUsername(target.value)}
      />
      <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
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
          handleBalance(values!.float!);
        }}
        decimalSeparator=","
        groupSeparator=" "
      />
      <Button onClick={handleNewUser}>Create user</Button>
    </>
  );
};

export default NewUser;
