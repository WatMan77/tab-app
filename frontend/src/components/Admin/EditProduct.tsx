import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  type SelectChangeEvent,
} from "@mui/material";
import CurrencyInput from "react-currency-input-field";
import DeleteIcon from "@mui/icons-material/Delete";

import { Color, type Product } from "../../types";
import { useState } from "react";

const EditProduct: React.FC<{
  product: Product;
  fetchProducts: () => void;
}> = ({ product, fetchProducts }) => {
  const [newName, setNewName] = useState(product.name);
  const [priceIn, setPriceIn] = useState(product.pricein);
  const [priceOut, setPriceOut] = useState(product.priceout);
  const [color, setColor] = useState(product.color);

  const userInfo = window.localStorage.getItem("loggedPiikkiAdmin");

  const colorMenuItems = () => {
    return Object.keys(Color).map((c) => (
      <MenuItem key={c} value={c}>
        {c}
      </MenuItem>
    ));
  };

  const handleNewColor = (event: SelectChangeEvent) => {
    setColor(event.target.value as Color);
  };

  const handleUpdate = async () => {
    const token = JSON.parse(userInfo!).token;
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": token },
      body: JSON.stringify({
        name: product.name,
        newName,
        pricein: priceIn,
        priceout: priceOut,
        color: color,
      }),
    };
    await fetch("http://localhost:3000/api/product", requestOptions);
    fetchProducts();
  };

  const handleDelete = async () => {
    const token = JSON.parse(userInfo!).token;
    const requestOptions = {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "Authorization": token },
      body: JSON.stringify({
        name: product.name,
      }),
    };
    await fetch("http://localhost:3000/api/product", requestOptions);
    fetchProducts();
  };

  return (
    <>
      <TextField
        variant="standard"
        className="product-name"
        value={newName}
        onChange={({ target }) => setNewName(target.value)}
      />
      <CurrencyInput
        decimalSeparator=","
        groupSeparator=" "
        value={Number((priceIn / 100).toFixed(2))}
        onValueChange={(_value, _name, values) => {
          setPriceIn(values!.float ? values!.float * 100 : 0);
        }}
      />
      <CurrencyInput
        decimalSeparator=","
        groupSeparator=" "
        value={Number((priceOut / 100).toFixed(2))}
        onValueChange={(_value, _name, values) => {
          setPriceOut(values!.float ? values!.float * 100 : 0);
        }}
      />
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Väri</InputLabel>
        <Select value={color} label={"Väri"} onChange={handleNewColor}>
          {colorMenuItems()}
        </Select>
      </FormControl>
      <Button variant="contained" color="secondary" onClick={handleUpdate}>
        Update
        {/* Update {product.name} */}
      </Button>
      <Button variant="outlined" color="error" onClick={handleDelete}>
        <DeleteIcon />
      </Button>
    </>
  );
};

export default EditProduct;
