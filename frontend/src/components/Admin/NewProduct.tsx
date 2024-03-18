import { useState } from "react";
import CurrencyInput from "react-currency-input-field";
import { TextField, Button } from "@mui/material";

const NewProduct = () => {
  const [name, setName] = useState("");
  const [priceIn, setPriceIn] = useState(0);
  const [priceOut, setPriceOut] = useState(0);

  const userInfo = window.localStorage.getItem("loggedPiikkiAdmin");

  const handlePriceIn = (price: number) => {
    console.log("WHat is the price IN?!?", price);
    if (!price) {
      setPriceIn(0);
      return;
    }

    setPriceIn(price * 100);
  };

  const handlePriceOut = (price: number) => {
    console.log("WHat is the price OUT?!?", price);

    if (!price) {
      setPriceIn(0);
      return;
    }

    setPriceOut(price * 100);
  };

  const handleNewDrink = async () => {
    const token = JSON.parse(userInfo!).token;
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": token },
      body: JSON.stringify({
        name,
        pricein: priceIn,
        priceout: priceOut,
      }),
    };
    try {
      await fetch("http://localhost:3000/api/product", requestOptions);
      setName("");
      setPriceIn(0);
      setPriceOut(0);
      window.location.reload();
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <>
      <TextField
        placeholder="Product name"
        value={name}
        onChange={({ target }) => setName(target.value)}
      />
      <CurrencyInput
        placeholder="Price in"
        onValueChange={(_value, _name, values) => {
          handlePriceIn(Number.parseFloat(values!.float!.toFixed(2)));
        }}
        decimalSeparator=","
        groupSeparator=" "
      />
      <CurrencyInput
        placeholder="Price out"
        onValueChange={(_value, _name, values) => {
          handlePriceOut(Number.parseFloat(values!.float!.toFixed(2)));
        }}
        decimalSeparator=","
        groupSeparator=" "
      />
      <Button onClick={handleNewDrink}>Add product</Button>
    </>
  );
};

export default NewProduct;
