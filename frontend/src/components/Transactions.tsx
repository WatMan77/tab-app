import { useEffect, useState } from "react";
import type { Log, Account } from "../types";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  type SelectChangeEvent,
} from "@mui/material";

const Transactions = () => {
  const [trans, setTrans] = useState<Log[]>([]);
  const [users, setUsers] = useState<Account[]>([]);
  const [selectedUser, setSelectedUser] = useState<Account>();
  useEffect(() => {
    fetch("/api/transaction")
      .then((x) => x.json())
      .then((data) => {
        setTrans(data);
      });
    fetch("/api/account")
      .then((x) => x.json())
      .then((data) => {
        setUsers(data);
      });
  }, []);

  const userMenuItems = (): JSX.Element[] => {
    return users.map((u) => (
      <MenuItem key={u.id!} value={u.id!}>
        {u.username}
      </MenuItem>
    ));
  };

  const handleNewUser = (event: SelectChangeEvent) => {
    const user = users.find((u) => u.username == event.target.value);
    if (user) {
      setSelectedUser(user);
    }
  };
  return (
    <div>
      <FormControl>
        <InputLabel id="demo-simple-select-label">Username</InputLabel>
        <Select value={""} label={"Väri"} onChange={handleNewUser}>
          {userMenuItems()}
        </Select>
      </FormControl>
      <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {trans.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.username}</td>
                <td>{transaction.product_name}</td>
                <td>{transaction.amount}</td>
                <td>
                  {new Date(transaction.transaction_date).toLocaleString(
                    "fi-FI",
                    {
                      year: "numeric",
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
