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
  const [priceIn, setPriceIn] = useState(0);
  const [priceOut, setPriceOut] = useState(0);
  const [color, setColor] = useState<Color>(Color.WHITE);

  const userInfo = window.localStorage.getItem("loggedPiikkiAdmin");

  const colorMenuItems = () => {
    return Object.keys(Color).map((c) => (
      <MenuItem key={c} value={c}>
        {c}
      </MenuItem>
    ));
  };

  const handlePriceIn = (price: number) => {
    if (!price) {
      setPriceIn(0);
      return;
    }

    setPriceIn(price * 100);
  };

  const handlePriceOut = (price: number) => {
    if (!price) {
      setPriceIn(0);
      return;
    }

    setPriceOut(price * 100);
  };

  const handleNewColor = (event: SelectChangeEvent) => {
    setColor(event.target.value as Color);
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
        color: color,
      }),
    };
    try {
      await fetch("http://localhost:3000/api/product", requestOptions);
      setName("");
      setPriceIn(0);
      setPriceOut(0);
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
        min={0}
        onValueChange={(_value, _name, values) => {
          const f = values!.float!;
          f == null || f == 0
            ? handlePriceIn(0)
            : handlePriceIn(Number.parseFloat(f.toFixed(2)));
        }}
        decimalSeparator=","
        groupSeparator=" "
      />
      <CurrencyInput
        placeholder="Price out"
        min={0}
        onValueChange={(_value, _name, values) => {
          const f = values!.float!;
          f == null || f == 0
            ? handlePriceOut(0)
            : handlePriceOut(Number.parseFloat(f.toFixed(2)));
        }}
        decimalSeparator=","
        groupSeparator=" "
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
