import DrinkComponent from "./DrinkComponent";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import type { Drink } from "../types";
import ShopList from "./ShopList";

const DrinkContainer = () => {
  const [sum, setSum] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const [drinkStates, setDrinkStates] = useState<{ [key: string]: number }>({
    Lonkero: 0,
    Bisse: 0,
    Campari: 0,
  });

  useEffect(() => {
    fetch("http://localhost:3000/api/product")
      .then((response) => response.json())
      .then((data) => console.log("Drinks", data));
  });

  console.log("What is the state?", location.state);

  const confirm = async () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ t: "React POST Request Example" }),
    };
    try {
      const response = await fetch(
        "http://localhost:3000/api/transaction",
        requestOptions
      );
      console.log(response);
    } catch (e) {
      console.log(e);
    }
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
