import type { Account } from "../types";
import { useState, useEffect, useCallback } from "react";
import UserBlock from "./UserBlock";
import { TextField } from "@mui/material";

const CategoryWrapper: React.FC<{
  users: { user: Account; pressed: boolean }[];
  changePress: (username: string) => void;
  nameFilter: string;
  setNameFilter: (name: string) => void;
}> = ({ users, changePress, nameFilter, setNameFilter }) => {
  const [filtered, setFiltered] = useState(users);

  const sortedByDate = useCallback(() => {
    const usersCopy = [...users];
    const f = usersCopy.sort((a, b) => {
      const dateA = a.user.recent ? new Date(a.user.recent).getTime() : null;
      const dateB = b.user.recent ? new Date(b.user.recent).getTime() : null;
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateB - dateA;
    });
    return f;
  }, [users]);

  const filteredByName = useCallback(
    (name: string): { user: Account; pressed: boolean }[] => {
      const searched = new Set(
        users.filter((u) =>
          u.user.username.toLowerCase().includes(name.toLowerCase())
        )
      );
      users.forEach((x) => {
        if (x.pressed) {
          searched.add(x);
        }
      });
      return [...searched];
    },
    [users]
  );

  useEffect(() => {
    const f = sortedByDate();
    // In addition filter by name if the name filter has a value
    let fu: Set<{
      user: Account;
      pressed: boolean;
    }> = new Set();
    if (nameFilter.trim() === "" || nameFilter.trim().length < 3) {
      fu = new Set(f.slice(0, 8));
    } else {
      fu = new Set(filteredByName(nameFilter));
    }
    f.forEach((x) => {
      if (x.pressed) {
        fu.add(x);
      }
    });

    //console.log("Before inserting?", [...fu]);

    setFiltered([...fu]);
  }, [users, sortedByDate, nameFilter, filteredByName]); // Update filtered state when users prop changes

  const handleChange = (name: string) => {
    const trimmed = name.trim();
    if (trimmed === "" || !name || trimmed.length < 3) {
      // Here null might be a problem
      const f = sortedByDate();

      const fu = new Set(f.slice(0, 8));
      f.forEach((x) => {
        if (x.pressed) {
          fu.add(x);
        }
      });

      setFiltered([...fu]);
    } else {
      const searched = new Set(filteredByName(name));
      users.forEach((x) => {
        if (x.pressed) {
          searched.add(x);
        }
      });
      setFiltered([...searched]);
    }
    setNameFilter(name);
  };
  return (
    <div className="account-grid">
      <TextField
        value={nameFilter}
        onChange={({ target }) => handleChange(target.value)}
      />
      {filtered.map((f) => (
        <UserBlock user={f} changePress={changePress} key={f.user.username} />
      ))}
    </div>
  );
};

export default CategoryWrapper;
