import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Dialog,
  DialogActions,
  type SelectChangeEvent,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
  const [priceIn, setPriceIn] = useState((product.pricein / 100).toFixed(2));
  const [priceOut, setPriceOut] = useState((product.priceout / 100).toFixed(2));
  const [color, setColor] = useState(product.color);
  const [open, setOpen] = useState(false);
  const [changed, setChanged] = useState(false); // If something changes, enable Update button

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

  const handleNewColor = (event: SelectChangeEvent) => {
    setColor(event.target.value as Color);
    setChanged(true);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleUpdate = async () => {
    const token = JSON.parse(userInfo!).token;
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": token },
      body: JSON.stringify({
        name: product.name,
        newName,
        pricein: Number.parseFloat(priceIn) * 100,
        priceout: Number.parseFloat(priceOut) * 100,
        color: color,
      }),
    };
    await fetch("/api/product", requestOptions);
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
    await fetch("/api/product", requestOptions);
    fetchProducts();
  };

  return (
    <>
      <TextField
        variant="standard"
        className="product-name"
        value={newName}
        onChange={({ target }) => {
          setNewName(target.value);
          setChanged(true);
        }}
      />
      <CurrencyInput
        decimalSeparator="."
        value={priceIn}
        onValueChange={(_value, _name, values) => {
          setPriceIn(priceFiltering(values!.value));
          setChanged(true);
        }}
      />
      <CurrencyInput
        decimalSeparator="."
        value={priceOut}
        onValueChange={(_value, _name, values) => {
          setPriceOut(priceFiltering(values!.value));
          setChanged(true);
        }}
      />
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Väri</InputLabel>
        <Select value={color} label={"Väri"} onChange={handleNewColor}>
          {colorMenuItems()}
        </Select>
      </FormControl>
      <Button
        variant="contained"
        color="secondary"
        disabled={!changed}
        onClick={handleUpdate}
      >
        Update
      </Button>

      <Button variant="outlined" color="error" onClick={handleClickOpen}>
        <DeleteIcon />
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Poistatko tuotteen?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Haluatko varmasti poistaa tuotteen {product.name}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={handleClose}>
            EI
          </Button>
          <Button variant="contained" onClick={handleDelete}>
            KYLLÄ
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditProduct;
