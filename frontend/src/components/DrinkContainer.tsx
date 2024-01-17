import DrinkComponent from "./DrinkComponent";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import type { Product, Account } from "../types";
import ShopList from "./ShopList";

const DrinkContainer = () => {
  const [sum, setSum] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

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
    const updatedProducts = drinkStates.map((p) => {
      if (p.product.name === product) {
        return { ...p, amount: p.amount + increase };
      } else {
        return p;
      }
    });
    setDrinkStates(updatedProducts);
  };

  const confirm = async () => {
    // Take all the drinks that have been added to the cart
    const items = drinkStates.filter((x) => x.amount >= 1);
    // This has all the users that want to order something
    //const users: { user: Account; pressed: boolean }[] = location.state;

    //WHAT THE HELL IS THIS TYPE?!?!?
    const users: { users: { user: Account; amount: number } }[] =
      location.state.users;
    console.log("Users?", users);
    console.log(
      "Mapped?",
      users.map((x) => x.users)
    );
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items,
        users: users.map((x) => x.users.user),
      }),
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

  return (
    <>
      {drinkStates.map((d) => (
        <DrinkComponent
          drink={d.product}
          drinkStates={drinkStates}
          updateAmount={updateAmount}
          sum={sum}
          add={setSum}
          key={d.product.name}
        />
      ))}
      Current price: {sum}
      <Button onClick={() => confirm()}>Confirm</Button>
      <ShopList drinkStates={drinkStates} />
    </>
  );
};

export default DrinkContainer;
