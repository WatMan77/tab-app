import type { Account } from "../types";
import { useMemo, useCallback } from "react";
import UserBlock from "./UserBlock";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const CategoryWrapper: React.FC<{
  users: { user: Account; pressed: boolean }[];
  changePress: (id: number) => void;
  nameFilter: string;
  setNameFilter: (name: string) => void;
}> = ({ users, changePress, nameFilter, setNameFilter }) => {

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

  const buildFilteredUsers = useCallback(
    (filter: string): { user: Account; pressed: boolean }[] => {
      const trimmedFilter = filter.trim().toLowerCase();
      const baseList = sortedByDate();

      let result: { user: Account; pressed: boolean }[];

      if (trimmedFilter === "" || trimmedFilter.length < 3) {
        result = baseList.slice(0, 20);
      } else {
        result = filteredByName(trimmedFilter);
      }

      // Include all pressed users (even if they weren't in the filtered list)
      const finalMap = new Map<number, { user: Account; pressed: boolean }>();
      result.forEach((u) => finalMap.set(u.user.id!, u));
      users.forEach((u) => {
        if (u.pressed) finalMap.set(u.user.id!, u);
      });

      return [...finalMap.values()];
    },
    [users, sortedByDate, filteredByName]
  );

  const filtered = useMemo(
    () => buildFilteredUsers(nameFilter),
    [buildFilteredUsers, nameFilter]
  );

  const handleChange = (name: string) => {
    setNameFilter(name);
  };
  return (
    <div className="account-grid">
      <div className="search">
        <TextField
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          variant="standard"
          value={nameFilter}
          onChange={({ target }) => handleChange(target.value)}
        />
      </div>
      {
        filtered.map((f) => (
          <UserBlock user={f} changePress={changePress} key={f.user.username} />
        ))
      }
    </div>
  );
};

export default CategoryWrapper;
