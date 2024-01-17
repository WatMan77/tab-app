import { UserType } from "./types";
import type { Account } from "./types";
import UserBlock from "./components/User";
import { useEffect, useState } from "react";
//import "./App.css";

const App = () => {
  const [users, setUsers] = useState<Account[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/account")
      .then((response) => response.json())
      .then((data) => setUsers(data));
  }, []);
  /*const users: User[] = [
    {
      name: "John Doe",
      type: UserType.ASUKAS,
      username: "john.doe",
      bank: 5000,
    },
    {
      name: "Jane Doe",
      type: UserType.VANHA,
      bank: 2000,
    },
    {
      name: "Bob Smith",
      type: UserType.HANGAROUND,
      bank: 3000,
    },
    {
      name: "Alice Johnson",
      type: UserType.ASUKAS,
      username: "alice.johnson",
      bank: 7000,
    },
    {
      name: "Charlie Brown",
      type: UserType.VANHA,
      bank: 1500,
    },
    {
      name: "Eve White",
      type: UserType.HANGAROUND,
      bank: 4000,
    },
    {
      name: "Frank Miller",
      type: UserType.ASUKAS,
      username: "frank.miller",
      bank: 6000,
    },
    {
      name: "Grace Davis",
      type: UserType.VANHA,
      bank: 2500,
    },
    {
      name: "Harry Turner",
      type: UserType.HANGAROUND,
      bank: 3500,
    },
    {
      name: "Ivy Green",
      type: UserType.ASUKAS,
      username: "ivy.green",
      bank: 8000,
    },
  ];*/

  return (
    <>
      <h2>Asukkaat</h2>
      <div className="buttonContainer">
        {users
          .filter((x) => x.category === UserType.ASUKAS)
          .map((u) => (
            <UserBlock user={u} key={u.username} />
          ))}
      </div>
      <h2>Vanhat</h2>
      <div className="buttonContainer">
        {users
          .filter((x) => x.category === UserType.VANHA)
          .map((u) => (
            <UserBlock user={u} key={u.username} />
          ))}
      </div>
      <h2>Hangaroundit</h2>
      <div className="buttonContainer">
        {users
          .filter((x) => x.category === UserType.HANGAROUND)
          .map((u) => (
            <UserBlock user={u} key={u.username} />
          ))}
      </div>
    </>
  );
};

export default App;
