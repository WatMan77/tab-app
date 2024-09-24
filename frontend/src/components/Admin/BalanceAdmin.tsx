import UpdateBalance from "./UpdateBalance";
import { useState, useEffect, useCallback } from "react";
import type { Account, UpdateAccount } from "../../types";
import NewUser from "./NewAccount";
import { Button } from "@mui/material";

const BalanceAdmin = () => {
  const [users, setUsers] = useState<
    { account: Account; change: number; newName: string }[]
  >([]);

  const userData = window.localStorage.getItem("loggedPiikkiAdmin");
  const token = JSON.parse(userData!).token;

  const balanceSum =
    users.map((u) => u.account.balance!).reduce((a, b) => a + b, 0) / 100;

  const compareAccounts = (a: Account, b: Account): number => {
    if (a.username < b.username) {
      return -1;
    }
    if (a.username > b.username) {
      return 1;
    }
    return 0;
  };

  const handleBalanceChange = useCallback(
    (username: string, change: number) => {
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.account.username === username ? { ...u, change } : u
        )
      );
    },
    [setUsers]
  );

  const handleNameChange = useCallback(
    (username: string, newName: string) => {
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.account.username === username ? { ...u, newName } : u
        )
      );
    },
    [setUsers]
  );

  const fetchUsers = useCallback(() => {
    fetch("/api/account")
      .then((res) => res.json())
      .then((data) => {
        data.sort(compareAccounts);
        setUsers(
          (data as Account[]).map((u: Account) => {
            return { account: u, change: 0, newName: "" };
          })
        );
      });
  }, []);

  const changePiikkiStatus = async (account: Account) => {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": token },
      body: JSON.stringify({
        account: account,
      }),
    };

    try {
      await fetch("/api/account/closed", requestOptions);
      fetchUsers();
    } catch (e) {
      console.log(e);
    }
  };

  const handleChangeConfirm = async () => {
    const filteredUsers = users.filter(
      (u) => u.change !== 0 || u.newName !== ""
    );
    const updatedChangeUsers: UpdateAccount[] = filteredUsers.map((u) => ({
      ...u.account,
      balance: u.account.balance! + u.change * 100,
      newName: u.newName,
    }));

    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": token },
      body: JSON.stringify({
        accounts: updatedChangeUsers,
      }),
    };
    try {
      await fetch("/api/balance", requestOptions);
    } catch (e) {
      console.log(e);
    }
    window.location.reload();
  };

  const handleDelete = async (id: number) => {
    const requestOptions = {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "Authorization": token },
      body: JSON.stringify({
        id,
      }),
    };
    try {
      await fetch("/api/account", requestOptions);
      fetchUsers();
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="container container--balance">
      <NewUser fetchUsers={fetchUsers} />

      {users.map((u) => (
        <UpdateBalance
          key={u.account.username}
          user={u}
          handleBalanceChange={handleBalanceChange}
          changePiikkiStatus={changePiikkiStatus}
          handleNameChange={handleNameChange}
          handleDelete={handleDelete}
        />
      ))}

      <div className="balance-footer">
        <div className="container">
          <p>
            Piikin tilanne: <strong>{balanceSum.toFixed(2)}€</strong>
          </p>

          <Button variant="contained" onClick={handleChangeConfirm}>
            Confirm change
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BalanceAdmin;
