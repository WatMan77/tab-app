import { useState } from "react";
import Drink from "./components/Drink";
import { Button, div } from "@mui/material";
import { UserType } from "./types";
import type { User } from "./types";
import UserBlock from "./components/User";
//import "./App.css";

function App() {
  const [sum, setSum] = useState(0);

  const [drinkStates, setDrinkStates] = useState<{ [key: string]: number }>({
    Lonkero: 0,
    Bisse: 0,
    Campari: 0,
  });

  const users: User[] = [
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
  ];

  const drinks = ["Lonkero", "Bisse", "Campari"];

  return (
    <>
      <h2>Asukkaat</h2>
      <div className="buttonContainer">
        {users
          .filter((x) => x.type === UserType.ASUKAS)
          .map((u) => (
            <UserBlock user={u} />
          ))}
      </div>
      <h2>Vanhat</h2>
      <div className="buttonContainer">
        {users
          .filter((x) => x.type === UserType.VANHA)
          .map((u) => (
            <UserBlock user={u} />
          ))}
      </div>
      <h2>Hangaroundit</h2>
      <div className="buttonContainer">
        {users
          .filter((x) => x.type === UserType.HANGAROUND)
          .map((u) => (
            <UserBlock user={u} />
          ))}
      </div>
    </>
  );
}

export default App;
