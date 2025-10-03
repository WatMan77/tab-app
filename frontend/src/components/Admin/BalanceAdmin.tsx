import UpdateBalance from "./UpdateBalance";
import { useState, useEffect, useCallback, useMemo, startTransition } from "react";
import type { Account, UpdateAccount, UserType } from "../../types";
import NewUser from "./NewAccount";
import { Button, TextField } from "@mui/material";
import { debounce } from "lodash";
import "../../styling/balanceadmin.scss";
import { toast } from "react-toastify";
import axios, { type AxiosRequestConfig } from "axios";

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

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await axios.get<Account[]>("/api/account");
      data.sort(compareAccounts);
      // Don't block scrolling or input while setting users.
      startTransition(() => {
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
      })
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        toast.error("Failed to fetch users: " + e.response?.data)
      } else if (e instanceof Error) {
        toast.error(e.message)
      } else {
        toast.error("Unexpected error: " + e)
      }
      console.log(e)
    }
  }, []);

  const fetchStats = async (): Promise<string> => {
    const res = await axios.get("/api/account/stats", {
      headers: { "Content-Type": "application/json", "Authorization": token }
    });
    const rows: { username: string; balance: number; closed: boolean }[] = res.data;

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
    try {
      const text = await fetchStats();
      await navigator.clipboard.writeText(text);
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        toast.error("Failed to fetch stats: " + e.response?.data)
      } else if (e instanceof Error) {
        toast.error(e.message)
      } else {
        toast.error("Unexpected error: " + e)
      }
    }
  }

  const changePiikkiStatus = async (account: Account) => {
    const requestOptions: AxiosRequestConfig = {
      headers: { "Content-Type": "application/json", "Authorization": token },
    };

    try {
      await axios.put("/api/account/closed", account, requestOptions);
      fetchUsers();
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const message = e?.response?.data && e.response.data !== "" ?
          e.response.data : e.message;
        toast.error("Error fetching products: " + message)
      } else {
        toast.error("Failed to update piikki status: ")
      }
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
      headers: { "Content-Type": "application/json", "Authorization": token }
    };
    try {
      await axios.put("/api/balance", { accounts: updatedChangeUsers }, requestOptions);
      window.location.reload();
    } catch (e) {
      console.log(e);
    }
  };

  const handleDelete = async (id: number) => {
    const requestOptions = {
      headers: { "Content-Type": "application/json", "Authorization": token }
    };
    try {
      await axios.delete(`/api/account/${id}`, requestOptions);
      fetchUsers();
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        toast.error("Error deleting account: " + e.response?.data)
      } else if (e instanceof Error) {
        toast.error(e.message)
      } else {
        toast.error("Unexpected error: " + e)
      }
      console.log(e);
    }
  };

  const debouncedFilterChange = useMemo(
    () =>
      debounce((filter: string) => {
        setUserFilter(filter);
      }, 300),
    []
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    return () => {
      debouncedFilterChange.cancel()
    }
  }, [debouncedFilterChange])

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
