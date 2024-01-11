import express from 'express';

const app = express();

const port = 3000;

app.get("/", (req,res) => {
    res.send("Hello world!");
});

app.listen(port, () => {
    return console.log("Server runningon port " + port);
});