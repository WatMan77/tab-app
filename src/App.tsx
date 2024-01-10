import { useState } from "react";
import Drink from "./components/Drink";
//import "./App.css";

function App() {
  const [sum, setSum] = useState(0);

  return (
    <>
      <h1>This is a blank space!</h1>
      <Drink name="Lonkero" price={1.2} />
    </>
  );
}

export default App;
