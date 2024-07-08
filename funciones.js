const { Pool } = require("pg")

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "colombia2024",
    port: 5432,
    database: "bancosolar",
});

const create = async(dato) => {
    try{
        
        const query = {
            text: "INSERT INTO usuarios(nombre, balance) VALUES ($1, $2) RETURNING *",
            values: dato
        }
        const result = await pool.query(query);
        return result;

    } catch(err){
        console.error("error al insertar", err);

    }
};

const consultar = async()=>{
    try{
        const consulta = {
            text: "SELECT * FROM usuarios"
        }
        result = await pool.query(consulta);
        return result.rows;
    }catch(error){
        console.error("error de consulta", error);
    }
};

const editar = async(dato)=>{
    try{
        const consulta = {
            text: "UPDATE usuarios SET nombre = $2, balance = $3 WHERE id = $1",            
            values: dato
        };
        const balance = Number(dato[2]);
        if (isNaN(balance) || balance < 0) {
            throw new Error("El balance debe ser un número mayor o igual a cero.");
        }

        const result = await pool.query(consulta);
        
        return result;
    }catch(error){
        console.error("error de consulta", error);
    }
};

const eliminar = async (id) => {
    try {
        const consulta = {
            text: "DELETE FROM usuarios WHERE id = $1",
            values: [id],
        };
        const result = await pool.query(consulta);
        return result;
    } catch (error) {
        console.error("Error de consulta", error);
    }
};

const obtenerId = async(nombre)=>{
    const result = await pool.query(`SELECT id FROM usuarios WHERE nombre = '${nombre}'`);
    return result.rows[0].id;
}
const createTransferencia = async (emisorNombre, receptorNombre, monto) => {
    try {
        const emisor = await obtenerId(emisorNombre);
        const receptor = await obtenerId(receptorNombre);

        // Obtener el balance actual del emisor
        const { rows: [{ balance }] } = await pool.query('SELECT balance FROM usuarios WHERE id = $1', [emisor]);

        // Verificar si el balance es suficiente para la transferencia
        if (balance < monto) {
            throw new Error('El balance del emisor es insuficiente para realizar la transferencia.');
        }

        // Iniciar la transacción
        await pool.query('BEGIN');

        // Descontar el monto del balance del emisor
        const descontar = {
            text: 'UPDATE usuarios SET balance = balance - $2 WHERE id = $1',
            values: [emisor, monto]
        };
        await pool.query(descontar);

        // Acreditar el monto al balance del receptor
        const acreditar = {
            text: 'UPDATE usuarios SET balance = balance + $2 WHERE id = $1',
            values: [receptor, monto]
        };
        await pool.query(acreditar);

        // Registrar la transferencia en la tabla de transferencias
        const transferencia = {
            text: 'INSERT INTO transferencias (emisor, receptor, monto, fecha) VALUES ($1, $2, $3, NOW())',
            values: [emisor, receptor, monto]
        };
        await pool.query(transferencia);

        // Confirmar la transacción
        await pool.query('COMMIT');

        return { success: true };

    } catch (error) {
        console.error('Error al crear transferencia', error);
        await pool.query('ROLLBACK');
        throw error; // Propagar el error para que se maneje en la capa superior
    }
};

const obtenerTransferencias = async()=>{
    try{
        const consulta = {
            text: "SELECT usuario1.nombre AS emisor, usuario2.nombre AS receptor, t.monto FROM usuarios usuario1 INNER JOIN transferencias t ON usuario1.id = t.emisor INNER JOIN usuarios usuario2 ON usuario2.id = t.receptor"
        }
        const result = await pool.query(consulta);
        return result.rows
    }catch (error) {
        console.error("Error al consultar transferencias", error);
    }
}

module.exports = {create, consultar, editar, eliminar, createTransferencia, obtenerTransferencias};