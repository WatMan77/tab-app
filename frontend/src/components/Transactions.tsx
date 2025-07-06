import { startTransition, useEffect, useState } from "react";
import type { Log, Account } from "../types";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  type SelectChangeEvent,
} from "@mui/material";
import "../styling/transactions.scss";

const Transactions = () => {
  const [trans, setTrans] = useState<Log[]>([]);
  const [users, setUsers] = useState<Account[]>([]);
  const [selectedUser, setSelectedUser] = useState<Account | null>(null);

  useEffect(() => {
    fetch("/api/transaction")
      .then((x) => x.json())
      .then((data) => {
        startTransition(() => {
          setTrans(data);

        })
      });
    fetch("/api/account")
      .then((x) => x.json())
      .then((data) => {
        startTransition(() => {
          setUsers(data);

        })
      });
  }, []);

  const fetchNewUser = async (id: number) => {
    const res = await fetch(`/api/transaction/${id}`);
    const data = await res.json();
    setTrans(data);
  };

  const compareAccounts = (a: Account, b: Account): number => {
    if (a.username < b.username) {
      return -1;
    }
    if (a.username > b.username) {
      return 1;
    }
    return 0;
  };
  const userMenuItems = (): JSX.Element[] => {
    const sortedUsers = [...users];
    sortedUsers.sort(compareAccounts);
    return sortedUsers.map((u) => (
      <MenuItem key={u.id!} value={u.username}>
        {u.username}
      </MenuItem>
    ));
  };

  const handleNewUser = async (event: SelectChangeEvent) => {
    if (event.target.value.trim() == "") {
      const res = await fetch("/api/transaction");
      const data = await res.json();
      setSelectedUser(null);
      setTrans(data);
    } else {
      const user = users.find((u) => u.username == event.target.value);
      if (user) {
        setSelectedUser(user);
        await fetchNewUser(user.id!);
      }
    }
  };
  return (
    <div className="transactions-container">
      <FormControl className="form-control">
        <InputLabel id="demo-simple-select-label">Käyttäjä</InputLabel>
        <Select
          value={selectedUser ? selectedUser.username : ""}
          label={"Väri"}
          onChange={handleNewUser}
        >
          <MenuItem value="">-</MenuItem>
          {userMenuItems()}
        </Select>
      </FormControl>
      <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Käyttäjä</th>
              <th>Tuote</th>
              <th>Määrä</th>
              <th>Summa</th>
              <th>Päivämäärä</th>
            </tr>
          </thead>
          <tbody>
            {trans.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.username}</td>
                <td>{transaction.product_name}</td>
                <td>{transaction.amount}</td>
                <td>{(transaction.sum / 100).toFixed(2)}</td>
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
