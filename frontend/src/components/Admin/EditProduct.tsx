import { Button, TextField } from "@mui/material";
import CurrencyInput from "react-currency-input-field";

import { Product } from "../../types";
import { useState } from "react";

const EditProduct: React.FC<{ product: Product }> = ({ product }) => {
  const [name, setName] = useState(product.name);
  const [priceIn, setPriceIn] = useState(product.pricein);
  const [priceOut, setPriceOut] = useState(product.priceout);

  const userInfo = window.localStorage.getItem("loggedPiikkiAdmin");

  const handleUpdate = async () => {
    const token = JSON.parse(userInfo!).token;
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": token },
      body: JSON.stringify({
        id: product.id,
        name,
        pricein: priceIn,
        priceout: priceOut,
      }),
    };
    await fetch("http://localhost:3000/api/product", requestOptions);
  };

  const handleDelete = async () => {
    const token = JSON.parse(userInfo!).token;
    const requestOptions = {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "Authorization": token },
      body: JSON.stringify({
        id: product.id,
      }),
    };
    await fetch("http://localhost:3000/api/product", requestOptions);
  };

  return (
    <div>
      <TextField
        value={name}
        onChange={({ target }) => setName(target.value)}
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
      <Button variant="contained" onClick={handleUpdate}>
        Update {product.name}
      </Button>
      <Button onClick={handleDelete}>Delete {product.name}</Button>
    </div>
  );
};

export default EditProduct;
