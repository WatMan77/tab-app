import DrinkComponent from "./DrinkComponent";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import type { Drink } from "../types";
import ShopList from "./ShopList";

const DrinkContainer = () => {
  const [sum, setSum] = useState(0);
  const navigate = useNavigate();

  const [drinkStates, setDrinkStates] = useState<{ [key: string]: number }>({
    Lonkero: 0,
    Bisse: 0,
    Campari: 0,
  });

  const confirm = () => {
    setSum(0);
    navigate("/");
  };

  const drinks: Drink[] = [
    {
      name: "Lonkero",
      price: 120,
    },
    {
      name: "Campari",
      price: 95,
    },
  ];

  return (
    <>
      {drinks.map((d) => (
        <DrinkComponent
          drink={d}
          setDrinkStates={setDrinkStates}
          drinkStates={drinkStates}
          sum={sum}
          add={setSum}
          key={d.name}
        />
      ))}
      Current price: {sum}
      <Button onClick={() => confirm()}>Confirm</Button>
      <ShopList drinks={drinks} amounts={drinkStates} />
    </>
  );
};

export default DrinkContainer;
