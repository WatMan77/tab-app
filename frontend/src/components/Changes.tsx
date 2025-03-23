import { useEffect, useState } from "react";
import type { BalanceChange, Account } from "../types";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  type SelectChangeEvent,
} from "@mui/material";
import "../styling/transactions.scss";
const Changes = () => {
  const [changes, setChanges] = useState<BalanceChange[]>([]);
  const [selectedUser, setSelectedUser] = useState<Account | null>(null);
  const [users, setUsers] = useState<Account[]>([]);

  useEffect(() => {
    fetch("/api/changes")
      .then((x) => x.json())
      .then((data) => setChanges(data));

    fetch("/api/account")
      .then((x) => x.json())
      .then((data) => {
        setUsers(data);
      });
  }, []);

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

  const fetchNewUser = async (id: number) => {
    const res = await fetch(`/api/changes/${id}`);
    const data = await res.json();
    setChanges(data);
  };

  const handleNewUser = async (event: SelectChangeEvent) => {
    if (event.target.value.trim() == "") {
      const res = await fetch("/api/changes");
      const data = await res.json();
      setSelectedUser(null);
      setChanges(data);
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
              <th>Määrä</th>
              <th>Päivämäärä</th>
            </tr>
          </thead>
          <tbody>
            {changes.map((change) => (
              <tr key={change.username + " " + change.change_date}>
                <td>{change.username}</td>
                <td>{(change.change / 100).toFixed(2)}</td>
                <td>
                  {new Date(change.change_date).toLocaleString("fi-FI", {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Changes;
