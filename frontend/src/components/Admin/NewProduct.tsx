import { useState } from "react";
import CurrencyInput from "react-currency-input-field";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  type SelectChangeEvent,
} from "@mui/material";
import { Color } from "../../types";

const NewProduct: React.FC<{ fetchProducts: () => void }> = ({
  fetchProducts,
}) => {
  const [name, setName] = useState("");
  const [priceIn, setPriceIn] = useState("");
  const [priceOut, setPriceOut] = useState("");
  const [color, setColor] = useState<Color>(Color.WHITE);

  const userInfo = window.localStorage.getItem("loggedPiikkiAdmin");

  const colorMenuItems = () => {
    return Object.keys(Color).map((c) => (
      <MenuItem key={c} value={c}>
        {c}
      </MenuItem>
    ));
  };

  const priceFiltering = (price: string) => {
    const match = price.match(/[0-9.]/g);
    const float = Number.parseFloat(price);

    if (!match || !float || float < 0) {
      return "";
    }

    let result = match.join("");
    const commaIndex = result.indexOf(".");

    if (commaIndex !== -1) {
      result = result.replace(/\./g, "");
      result = result.slice(0, commaIndex) + "." + result.slice(commaIndex);
    }

    return result;
  };

  const handlePriceIn = (price: string) => {
    setPriceIn(priceFiltering(price));
  };

  const handlePriceOut = (price: string) => {
    setPriceOut(priceFiltering(price));
  };

  const handleNewColor = (event: SelectChangeEvent) => {
    setColor(event.target.value as Color);
  };

  const handleNewDrink = async () => {
    const token = JSON.parse(userInfo!).token;
    console.log("Prices?", priceIn, priceOut);
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": token },
      body: JSON.stringify({
        name,
        pricein: Number.parseFloat(priceIn) * 100,
        priceout: Number.parseFloat(priceOut) * 100,
        color: color,
      }),
    };
    console.log("New drink:", requestOptions.body);

    try {
      await fetch("http://localhost:3000/api/product", requestOptions);
      setName("");
      setPriceIn("");
      setPriceOut("");
      setColor(Color.WHITE);
      fetchProducts();
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <div className="box-container box-container--add">
      <TextField
        label="Product name"
        placeholder="Product name"
        value={name}
        onChange={({ target }) => setName(target.value)}
        sx={{ m: 1, minWidth: 120, flexGrow: 1 }}
      />
      <CurrencyInput
        placeholder="Price in"
        value={priceIn}
        onValueChange={(_value, _name, values) => {
          handlePriceIn(values!.value);
        }}
        decimalSeparator="."
      />
      <CurrencyInput
        placeholder="Price out"
        value={priceOut}
        onValueChange={(_value, _name, values) => {
          handlePriceOut(values!.value);
        }}
        decimalSeparator="."
      />

      <FormControl>
        <InputLabel id="demo-simple-select-label">Väri</InputLabel>
        <Select value={color} label={"Väri"} onChange={handleNewColor}>
          {colorMenuItems()}
        </Select>
      </FormControl>
      <Button variant="contained" onClick={handleNewDrink} fullWidth>
        Add product
      </Button>
    </div>
  );
};

export default NewProduct;
