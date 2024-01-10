import Drink from "./Drink";
import { useState } from "react";

const DrinkContainer = () => {
  const [sum, setSum] = useState(0);

  const [drinkStates, setDrinkStates] = useState<{ [key: string]: number }>({
    Lonkero: 0,
    Bisse: 0,
    Campari: 0,
  });

  const drinks = [
    {
      name: "Lonkero",
      price: 1.2,
    },
    {
      name: "Campari",
      price: 0.95,
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
    </>
  );
};

export default DrinkContainer;
