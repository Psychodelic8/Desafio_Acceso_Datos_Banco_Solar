const {create, consultar, editar, eliminar, createTransferencia, obtenerTransferencias} = require("./funciones")
const express = require ("express");
const app = express();
const host = process.env.HOST || "localhost";
const protocol = process.env.PROTOCOL || "http"; 
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.info (`Servidor disponible en ${protocol}://${host}:${port}`)
});

app.use(express.json());

// 21:38 pm nos conectamos para trabajar en grupo el texto
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
})

// Manejando la ruta del requerimiento
app.post("/usuario", async (req, res) => {
    try{
        const data = Object.values(req.body);
        const balance = Number(data[1]);
        if (isNaN(balance) || balance < 0) {
            return res.status(400).send("El balance debe ser un número mayor o igual a cero.");
        }
        const result = await create(data);
        res.send(result)
    } catch(err){
        console.log ("error en el metodo post", err); 
    }
});

app.get("/usuarios", async(req, res)=>{
    try{
        const result = await consultar();
         res.json(result);
    }catch(err){
        console.error("error", err);
        res.status(500).send("Algo salio mal",err);
    }
});


app.put("/usuario/:id", async (req, res) => {
    try {
        const data = [req.params.id, ...Object.values(req.body)]; 
        const result = await editar(data);
        res.json(result);
    } catch (err) {
        console.error("Error al editar", err);
        res.status(500).send("Algo salió mal", err);
    }
});

app.delete("/usuario/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const respuesta = await eliminar(id);
        res.json(respuesta);
    } catch (error) {
        console.error("Error encontrado: ", error);
        res.status(500).send("Algo salio mal :(")
    }
});

app.post("/transferencia", async (req, res) => {
    const {emisor, receptor, monto} = req.body; 
    if (isNaN(monto)) {
        return res.status(400).send("El monto debe ser un número.");
    }
    try{
        const result = await createTransferencia(emisor, receptor, monto);
        res.json(result)


    } catch (error) {
        console.error("Error encontrado al transferir: ", error);
        res.status(500).send("Algo salio mal :(")
    }
});
app.get("/transferencias", async(req, res)=>{
    try{
        const result = await obtenerTransferencias();
        res.json(result);
    }catch(error) {
        console.error("Error encontrado: ", error);
        throw error;
        res.status(500).send("Algo salio mal :(")
    }
})