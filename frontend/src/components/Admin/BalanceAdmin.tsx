import UpdateBalance from "./UpdateBalance";
import { useState, useEffect, useCallback, useMemo } from "react";
import type { Account, UpdateAccount, UserType } from "../../types";
import NewUser from "./NewAccount";
import { Button, TextField } from "@mui/material";
import { debounce } from "lodash";
import "../../styling/balanceadmin.scss";

const BalanceAdmin = () => {
  const [users, setUsers] = useState<
    {
      account: Account;
      change: number;
      newName: string;
      newCategory: UserType;
      pincode: string;
    }[]
  >([]);
  const [userFilter, setUserFilter] = useState("");
  const [showClosed, setShowClosed] = useState(false);

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

  const handleBalanceChange = useCallback((id: number, change: number) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.account.id! === id ? { ...u, change } : u))
    );
  }, []);

  const handleNameChange = useCallback((id: number, newName: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.account.id! === id ? { ...u, newName } : u))
    );
  }, []);

  const handleCategoryChange = (id: number, newCategory: UserType) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.account.id! === id ? { ...u, newCategory } : u))
    );
  };

  const handlePinChange = (id: number, newPin: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.account.id! === id ? { ...u, pincode: newPin.replace(/\D/g, "") } : u))) // Allow only numbers
  }

  const fetchUsers = useCallback(() => {
    fetch("/api/account")
      .then((res) => res.json())
      .then((data) => {
        data.sort(compareAccounts);
        setUsers(
          (data as Account[]).map((u: Account) => {
            return {
              account: u,
              change: 0,
              newName: "",
              newCategory: u.category,
              pincode: "",
              unlockedUntil: ""
            };
          })
        );
      });
  }, []);

  const fetchStats = async () => {
    const res = await fetch("/api/account/stats", {
      headers: { "Content-Type": "application/json", "Authorization": token, method: "GET" }
    });
    const rows: { username: string; balance: number; closed: boolean }[] = await res.json();

    const usernames = rows.map((u) => u.username);
    const balances = rows.map((u) => (u.balance / 100).toFixed(2));
    const closeds = rows.map((u) => String(u.closed));

    const usernameWidth = Math.max("username".length, ...usernames.map((s) => s.length));
    const balanceWidth = Math.max("balance".length, ...balances.map((s) => s.length));
    const closedWidth = Math.max("closed".length, ...closeds.map((s) => s.length));

    // Helper function
    const pad = (text: string, width: number) => text + " ".repeat(width - text.length);

    const header =
      pad("username", usernameWidth) +
      " | " +
      pad("balance", balanceWidth) +
      " | " +
      pad("closed", closedWidth);

    const separator = `${"-".repeat(usernameWidth)}-+-${"-".repeat(balanceWidth)}-+-${"-".repeat(closedWidth)}`;

    const data = rows
      .map(
        (u) =>
          pad(u.username, usernameWidth) +
          " | " +
          pad((u.balance / 100).toFixed(2), balanceWidth) +
          " | " +
          pad(String(u.closed), closedWidth)
      )
      .join("\n");

    return `${header}\n${separator}\n${data}`;
  };

  const handleCopyStats = async () => {
    const text = await fetchStats();
    await navigator.clipboard.writeText(text);
  }

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
      (u) =>
        u.change !== 0 ||
        u.newName !== "" ||
        u.newCategory !== u.account.category ||
        u.pincode !== ""
    );
    if (filteredUsers.length == 0) {
      return;
    }
    const updatedChangeUsers: UpdateAccount[] = filteredUsers.map((u) => ({
      ...u.account,
      balance: u.account.balance! + u.change * 100,
      newName: u.newName,
      newCategory: u.newCategory,
      change: u.change * 100,
      pincode: u.pincode
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

  const debouncedFilterChange = useMemo(
    () =>
      debounce((filter: string) => {
        setUserFilter(filter);
      }, 300),
    []
  );

  const filteredUsers = useMemo(() => {
    let filtered = [...users];
    if (showClosed) {
      filtered = filtered.filter((u) => u.account.closed);
    }
    if (userFilter !== null && userFilter.length >= 3) {
      filtered = filtered.filter((u) =>
        u.account.username.toLowerCase().includes(userFilter.toLowerCase())
      );
    }
    return filtered;
  }, [userFilter, users, showClosed]);

  return (
    <div className="container container--balance">
      <NewUser fetchUsers={fetchUsers} />

      <div className="filter">
        <TextField
          label="Filter name"
          onChange={({ target }) => debouncedFilterChange(target.value)}
        />
        <Button
          className={showClosed ? "closed" : ""}
          variant="contained"
          onClick={() => setShowClosed(!showClosed)}
        >
          Closed
        </Button>
      </div>

      {filteredUsers.map((u) => (
        <UpdateBalance
          key={u.account.username}
          user={u}
          handleBalanceChange={handleBalanceChange}
          changePiikkiStatus={changePiikkiStatus}
          handleNameChange={handleNameChange}
          handleDelete={handleDelete}
          handleCategoryChange={handleCategoryChange}
          handlePinChange={handlePinChange}
        />
      ))}

      <div className="balance-footer">
        <div className="container">
          <p>
            Piikin tilanne: <strong>{balanceSum.toFixed(2)}</strong>
          </p>
          <Button variant="contained" onClick={handleCopyStats}>
            Copy stats
          </Button>

          <Button variant="contained" onClick={handleChangeConfirm}>
            Confirm change
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BalanceAdmin;
