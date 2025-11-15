import { startTransition, useEffect, useState } from "react";
import type { LogInformation, Account } from "../types";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  type SelectChangeEvent,
  Pagination,
} from "@mui/material";
import "../styling/transactions.scss";
import axios from "axios";
import { toast } from "react-toastify";

const Transactions = () => {
  const [trans, setTrans] = useState<LogInformation>({ count: 0, logs: [] });
  const [users, setUsers] = useState<Account[]>([]);
  const [selectedUser, setSelectedUser] = useState<Account | null>(null);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    try {
      if (selectedUser) {
        axios.get(`/api/transaction/${selectedUser.id!}?page=${page}`)
          .then(res => {
            startTransition(() => {
              setTrans(res.data);

            })
          });
      } else {
        axios.get("/api/transaction?page=" + page)
          .then(res => {
            startTransition(() => {
              setTrans(res.data);

            })
          });
      }
      axios.get("/api/account")
        .then(res => {
          startTransition(() => {
            setUsers(res.data);

          })
        });
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        toast.error("Failed to fetch transaction data: " + e.response?.data)
      } else if (e instanceof Error) {
        toast.error(e.message)
      } else {
        toast.error("Unexpected error " + e)
      }
    }
  }, [page, selectedUser]);

  const fetchNewUser = async (id: number) => {
    const res = await axios.get(`/api/transaction/${id}?page=${1}`);
    setPage(1)
    setTrans(res.data);
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
    try {
      if (event.target.value.trim() == "") {
        const res = await axios.get("/api/transaction?page=1");
        setSelectedUser(null);
        setPage(1)
        setTrans(res.data);
      } else {
        const user = users.find((u) => u.username == event.target.value);
        if (user) {
          setSelectedUser(user);
          await fetchNewUser(user.id!);
        }
      }
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        toast.error("Error handling new user: " + e.response?.data)
      } else if (e instanceof Error) {
        toast.error(e.message)
      } else {
        toast.error("Unexpecte error: " + e)
      }
    }

  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    console.log("new value " + value)
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
              <th>Tuote</th>
              <th>Määrä</th>
              <th>Summa</th>
              <th>Päivämäärä</th>
            </tr>
          </thead>
          <tbody>
            {trans.logs.map((transaction, index) => (
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
      <Pagination count={Math.ceil(trans.count / 50)} page={page} onChange={handlePageChange} />
    </div>
  );
};

export default Transactions;
