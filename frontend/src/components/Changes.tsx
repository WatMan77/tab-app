import { useEffect, useState } from "react";
import type { BalanceChangeInfo, Account } from "@app/common";
import axios from 'axios';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  type SelectChangeEvent,
  Pagination,
} from "@mui/material";
import "../styling/transactions.scss";
import { toast } from "react-toastify";
const Changes = () => {
  const [changes, setChanges] = useState<BalanceChangeInfo>({ count: 0, changes: [] });
  const [selectedUser, setSelectedUser] = useState<Account | null>(null);
  const [users, setUsers] = useState<Account[]>([]);
  const [page, setPage] = useState<number>(1);


  useEffect(() => {
    axios.get("/api/changes?page=" + page)
      .then(res => setChanges(res.data));

    axios.get("/api/account")
      .then(res => {
        setUsers(res.data);
      });
  }, [page]);

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
    const res = await axios.get(`/api/changes/${id}?page=1`);
    setChanges(res.data);
  };

  const handleNewUser = async (event: SelectChangeEvent) => {
    try {
      if (event.target.value.trim() == "") {
        const res = await axios.get("/api/changes");
        setSelectedUser(null);
        setChanges(res.data);
      } else {
        const user = users.find((u) => u.username == event.target.value);
        if (user) {
          setSelectedUser(user);
          await fetchNewUser(user.id!);
        }
      }
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const message = e?.response?.data && e.response.data !== "" ?
          e.response.data : e.message;
        toast.error("Error fetching new user : " + JSON.stringify(message))
      } else if (e instanceof Error) {
        toast.error("Error fetching new user: " + e.message)
      } else {
        toast.error("Unexpected error")
      }
    }
  };
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  }
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
            {changes.changes.map((change) => (
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
      <Pagination count={Math.ceil(changes.count / 50)} page={page} onChange={handlePageChange} />
    </div>
  );
};

export default Changes;
