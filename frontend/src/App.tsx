import { UserType } from "./types";
import type { Account } from "./types";
import UserBlock from "./components/UserBlock";
import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

//import "./App.css";

const App = () => {
  const [users, setUsers] = useState<{ user: Account; pressed: boolean }[]>([]);
  const navigate = useNavigate();

  const selectProducts = () => {
    navigate("/piikki", { state: { users: users.filter((u) => u.pressed) } });
  };

  const changePress = (username: string) => {
    const updatedUsers = users.map((x) => {
      if (x.user.username === username) {
        console.log(`Changed ${x.user.username} to ${!x.pressed}`);
        return { ...x, pressed: !x.pressed };
      } else {
        return x;
      }
    });
    setUsers(updatedUsers);
  };

  useEffect(() => {
    fetch("http://localhost:3000/api/account")
      .then((response) => response.json())
      .then((data) => {
        setUsers(data.map((user: Account) => ({ user, pressed: false })));
      });
  }, []);

  return (
    <>
      <h2>Asukkaat</h2>
      <div className="buttonContainer">
        {users
          .filter((x) => x.user.category === UserType.ASUKAS)
          .map((u) => (
            <UserBlock
              user={u.user}
              changePress={changePress}
              key={u.user.username}
            />
          ))}
      </div>
      <h2>Vanhat</h2>
      <div className="buttonContainer">
        {users
          .filter((x) => x.user.category === UserType.VANHA)
          .map((u) => (
            <UserBlock
              user={u.user}
              changePress={changePress}
              key={u.user.username}
            />
          ))}
      </div>
      <h2>Hangaroundit</h2>
      <div className="buttonContainer">
        {users
          .filter((x) => x.user.category === UserType.HANGAROUND)
          .map((u) => (
            <UserBlock
              user={u.user}
              changePress={changePress}
              key={u.user.username}
            />
          ))}
      </div>
      <div>
        <Button variant="contained" onClick={selectProducts}>
          Drinks
        </Button>
      </div>
    </>
  );
};

export default App;
