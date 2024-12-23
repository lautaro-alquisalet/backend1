const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const router = express.Router();
const rutaCarritos = path.join(__dirname, "../data/carts.json");

const leerCarritos = async () => {
    try {
        const datos = await fs.readFile(rutaCarritos, "utf-8");
        return JSON.parse(datos);
        } catch (err) {
        return [];
    }
};

const escribirCarritos = async (carritos) => {
    await fs.writeFile(rutaCarritos, JSON.stringify(carritos, null, 2));
};

router.post("/", async (req, res) => {
    const carritos = await leerCarritos();
    const id = (carritos.length ? Math.max(...carritos.map((c) => parseInt(c.id))) + 1 : 1).toString();
    const nuevoCarrito = { id, productos: [] };

    carritos.push(nuevoCarrito);
    await escribirCarritos(carritos);
    res.status(201).json(nuevoCarrito);
});

router.get("/:cid", async (req, res) => {
    const { cid } = req.params;
    const carritos = await leerCarritos();
    const carrito = carritos.find((c) => c.id === cid);
    carrito ? res.json(carrito.productos) : res.status(404).json({ error: "Carrito no encontrado" });
});

router.post("/:cid/producto/:pid", async (req, res) => {
    const { cid, pid } = req.params;
    const carritos = await leerCarritos();
    const carrito = carritos.find((c) => c.id === cid);

    if (!carrito) {
        return res.status(404).json({ error: "Carrito no encontrado" });
    }

    const producto = carrito.productos.find((p) => p.producto === pid);
        if (producto) {
        producto.cantidad += 1;
    } else {
    carrito.productos.push({ producto: pid, cantidad: 1 });
    }

    await escribirCarritos(carritos);
    res.status(201).json(carrito);
});

module.exports = router;
