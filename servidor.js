const express = require("express");
const productosRouter = require("./routes/products.js");
const carritosRouter = require("./routes/carts.js");

const app = express();
const PUERTO = 8080;

app.use(express.json());
app.use("/productos", productosRouter);
app.use("/carritos", carritosRouter);

app.listen(PUERTO, () => {
    console.log(`Servidor escuchando en el puerto ${PUERTO}`);
});
