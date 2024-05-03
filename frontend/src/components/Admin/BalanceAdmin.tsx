import UpdateBalance from "./UpdateBalance";
import { useState, useEffect } from "react";
import type { Account } from "../../types";
import NewUser from "./NewAccount";
import { Button } from "@mui/material";

const BalanceAdmin = () => {
  const [users, setUsers] = useState<{ account: Account; change: number }[]>(
    []
  );

  const userData = window.localStorage.getItem("loggedPiikkiAdmin");
  const token = JSON.parse(userData!).token;

  const balanceSum =
    users.map((u) => u.account.balance!).reduce((a, b) => a + b, 0) / 100;

  const handleBalanceChange = (username: string, change: number) => {
    const newState = users.map((u) => {
      if (u.account.username === username) {
        return { ...u, change };
      } else {
        return u;
      }
    });
    setUsers(newState);
  };

  const fetchUsers = () => {
    fetch("http://localhost:3000/api/account")
      .then((res) => res.json())
      .then((data) => {
        setUsers(
          (data as Account[]).map((u: Account) => {
            return { account: u, change: 0 };
          })
        );
      });
  };

  const changePiikkiStatus = async (account: Account) => {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": token },
      body: JSON.stringify({
        account: account,
      }),
    };

    try {
      await fetch("http://localhost:3000/api/account/closed", requestOptions);
      fetchUsers();
    } catch (e) {
      console.log(e);
    }
  };

  const handleChangeConfirm = async () => {
    const filteredUsers = users.filter((u) => u.change !== 0);
    const updatedChangeUsers: Account[] = filteredUsers.map((u) => ({
      ...u.account,
      balance: u.account.balance! + u.change * 100,
    }));

    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": token },
      body: JSON.stringify({
        accounts: updatedChangeUsers,
      }),
    };
    try {
      await fetch("http://localhost:3000/api/balance", requestOptions);
    } catch (e) {
      console.log(e);
    }
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <NewUser fetchUsers={fetchUsers} />

      <Button variant="contained" onClick={handleChangeConfirm}>
        Confirm change
      </Button>

      {users.map((u) => (
        <UpdateBalance
          key={u.account.username}
          user={u}
          handleBalanceChange={handleBalanceChange}
          changePiikkiStatus={changePiikkiStatus}
        />
      ))}

      <p>Piikin tilanne: {balanceSum.toFixed(2)}€</p>
    </div>
  );
};

export default BalanceAdmin;
