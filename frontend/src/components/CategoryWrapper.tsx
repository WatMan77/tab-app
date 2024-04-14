import type { Account } from "../types";
import { useState, useEffect } from "react";
import UserBlock from "./UserBlock";
import { TextField } from "@mui/material";

const CategoryWrapper: React.FC<{
  users: { user: Account; pressed: boolean }[];
  changePress: (username: string) => void;
}> = ({ users, changePress }) => {
  const [filtered, setFiltered] = useState(users);

  useEffect(() => {
    setFiltered(users);
  }, [users]); // Update filtered state when users prop changes

  const handleChange = (name: string) => {
    if (name === "" || !name) {
      setFiltered(users);
    } else {
      setFiltered(
        users.filter((u) =>
          u.user.username.toLowerCase().includes(name.toLowerCase())
        )
      );
    }
  };
  return (
    <div className="account-grid">
      <TextField onChange={({ target }) => handleChange(target.value)} />
      {filtered.map((f) => (
        <UserBlock user={f} changePress={changePress} key={f.user.username} />
      ))}
    </div>
  );
};

export default CategoryWrapper;
