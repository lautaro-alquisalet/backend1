const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const router = express.Router();
const rutaProductos = path.join(__dirname, "../data/products.json");

const leerProductos = async () => {
    try {
        const datos = await fs.readFile(rutaProductos, "utf-8");
        return JSON.parse(datos);
    } catch (err) {
    return [];
    }
};

const escribirProductos = async (productos) => {
    await fs.writeFile(rutaProductos, JSON.stringify(productos, null, 2));
};

router.get("/", async (req, res) => {
    const { limite } = req.query;
    const productos = await leerProductos();
    res.json(limite ? productos.slice(0, Number(limite)) : productos);
});

router.get("/:pid", async (req, res) => {
    const { pid } = req.params;
    const productos = await leerProductos();
    const producto = productos.find((p) => p.id === pid);
    producto ? res.json(producto) : res.status(404).json({ error: "Producto no encontrado" });
});

router.post("/", async (req, res) => {
    const { titulo, descripcion, codigo, precio, estado = true, inventario, categoria, imagenes = [] } = req.body;

    if (!titulo || !descripcion || !codigo || !precio || inventario === undefined || !categoria) {
        return res.status(400).json({ error: "Todos los campos son obligatorios excepto imagenes" });
    }

        const productos = await leerProductos();
    const id = (productos.length ? Math.max(...productos.map((p) => parseInt(p.id))) + 1 : 1).toString();
    const nuevoProducto = { id, titulo, descripcion, codigo, precio, estado, inventario, categoria, imagenes };

    productos.push(nuevoProducto);
    await escribirProductos(productos);
    res.status(201).json(nuevoProducto);
});

router.put("/:pid", async (req, res) => {
    const { pid } = req.params;
    const camposActualizados = req.body;
    if (camposActualizados.id) {
        return res.status(400).json({ error: "El id no puede ser actualizado" });
    }

    const productos = await leerProductos();
    const indiceProducto = productos.findIndex((p) => p.id === pid);
    if (indiceProducto === -1) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }

    productos[indiceProducto] = { ...productos[indiceProducto], ...camposActualizados };
    await escribirProductos(productos);
    res.json(productos[indiceProducto]);
});

router.delete("/:pid", async (req, res) => {
    const { pid } = req.params;
    const productos = await leerProductos();
    const productosFiltrados = productos.filter((p) => p.id !== pid);

    if (productosFiltrados.length === productos.length) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }

    await escribirProductos(productosFiltrados);
    res.status(204).send();
});

module.exports = router;
