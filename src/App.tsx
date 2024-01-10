import { useState } from "react";
import Drink from "./components/Drink";
import { Button } from "@mui/material";
//import "./App.css";

function App() {
  const [sum, setSum] = useState(0);

  const [drinkStates, setDrinkStates] = useState<{ [key: string]: number }>({
    Lonkero: 0,
    Bisse: 0,
    Campari: 0,
  });

  console.log("Drinks states", drinkStates);

  const drinks = ["Lonkero", "Bisse", "Campari"];

  return (
    <>
      {drinks.map((d) => (
        <Drink
          name={d}
          price={1.2}
          add={setSum}
          setDrinkStates={setDrinkStates}
          drinkStates={drinkStates}
          sum={sum}
          key={d}
        />
      ))}
      <h1>Current price is: {sum}</h1>
      <Button onClick={() => setSum(0)}>Confirm</Button>
    </>
  );
}

export default App;
