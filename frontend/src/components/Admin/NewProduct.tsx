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
import axios from 'axios';
import { toast } from "react-toastify";

const NewProduct: React.FC<{ fetchProducts: () => void }> = ({
  fetchProducts,
}) => {
  const [name, setName] = useState("");
  const [priceIn, setPriceIn] = useState("");
  const [priceOut, setPriceOut] = useState("");
  const [color, setColor] = useState<Color>(Color.EMPTY);

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
    const requestOptions = {
      headers: { "Content-Type": "application/json", "Authorization": token },
    };

    const body = {
      name,
      pricein: Number.parseFloat(priceIn) * 100,
      priceout: Number.parseFloat(priceOut) * 100,
      color: color,
    };

    try {
      await axios.post("/api/product", body, requestOptions);
      setName("");
      setPriceIn("");
      setPriceOut("");
      setColor(Color.EMPTY);
      fetchProducts();
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const message = e?.response?.data && e.response.data !== "" ?
          e.response.data : e.message;
        toast.error("Failed to create product: " + message)
      } else if (e instanceof Error) {
        toast.error(e.message)
      } else {
        toast.error("Unexpected error)")
      }
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
