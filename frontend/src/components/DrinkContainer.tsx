import DrinkComponent from "./DrinkComponent";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import type { Product } from "../types";
import ShopList from "./ShopList";

const DrinkContainer = () => {
  const [sum, setSum] = useState(0);
  const navigate = useNavigate();
  //const location = useLocation();

  const [drinkStates, setDrinkStates] = useState<
    { product: Product; amount: number }[]
  >([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/product")
      .then((response) => response.json())
      .then((data: Product[]) => {
        setDrinkStates(
          data.map((x) => {
            return { product: x, amount: 0 };
          })
        );
      });
  }, []);

  const updateAmount = (product: string, increase: number) => {
    console.log("Do we update a product?", product);
    const updatedProducts = drinkStates.map((p) => {
      if (p.product.name === product) {
        console.log("Yes we did!", p.product.name);
        return { ...p, amount: p.amount + increase };
      } else {
        console.log("Could not find ", product);
        return p;
      }
    });
    setDrinkStates(updatedProducts);
  };

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

  const drinks: Product[] = [
    {
      name: "Sininen",
      pricein: 120,
      priceout: 200,
    },
    {
      name: "Campari",
      pricein: 95,
      priceout: 300,
    },
  ];

  return (
    <>
      {drinks.map((d) => (
        <DrinkComponent
          drink={d}
          drinkStates={drinkStates}
          updateAmount={updateAmount}
          sum={sum}
          add={setSum}
          key={d.name}
        />
      ))}
      Current price: {sum}
      <Button onClick={() => confirm()}>Confirm</Button>
      <ShopList drinkStates={drinkStates} />
    </>
  );
};

export default DrinkContainer;
