import Drink from "./Drink";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

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

  const drinks = [
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
        <Drink
          name={d.name}
          price={d.price}
          setDrinkStates={setDrinkStates}
          drinkStates={drinkStates}
          sum={sum}
          add={setSum}
          key={d.name}
        />
      ))}
      Current price: {sum}
      <Button onClick={() => confirm()}>Confirm</Button>
    </>
  );
};

export default DrinkContainer;
