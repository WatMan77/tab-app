import DrinkComponent from "./DrinkComponent";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import type { Product, Account } from "../types";
import ShopList from "./ShopList";
import Other from "./OtherDrink";

const DrinkContainer = () => {
  const [sum, setSum] = useState(0);
  // State for the arbitrary amount you want to insert
  const [other, setOther] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const users: { user: Account; amount: number }[] = useMemo(() => {
    return location.state ? location.state.users : [];
  }, [location.state]);

  const [drinkStates, setDrinkStates] = useState<
    { product: Product; amount: number }[]
  >([]);

  useEffect(() => {
    if (!users || users.length < 1) {
      navigate("/");
    }
    fetch("http://localhost:3000/api/product")
      .then((response) => response.json())
      .then((data: Product[]) => {
        setDrinkStates(
          data.map((x) => {
            return { product: x, amount: 0 };
          })
        );
      });
  }, [navigate, users]);

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
    console.log("Items?", items);
    // add the "other" category if necessary
    if (other > 0) {
      items.concat();
    }
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items,
        users: users.map((x) => x.user),
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
    setOther(0);
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
      <Other add={setOther} sum={other} />
      Current price: {(sum + other * 100) / 100}€
      <Button onClick={() => confirm()}>Confirm</Button>
      <ShopList drinkStates={drinkStates} />
      <h1>Customers</h1>
      <ul>
        {users.map((u) => (
          <li key={u.user.id}>
            {u.user.username} {u.user.balance! / 100}€
          </li>
        ))}
      </ul>
    </>
  );
};

export default DrinkContainer;
