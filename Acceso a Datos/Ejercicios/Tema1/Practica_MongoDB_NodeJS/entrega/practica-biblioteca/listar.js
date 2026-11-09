// Ejercicio 14 - listar.js
// Práctica MongoDB y Node.js
// Acceso a Datos - 2º DAM

const { MongoClient } = require("mongodb"); // cargar la librería
const cliente = new MongoClient("mongodb://127.0.0.1:27017");

async function main() {
  try {
    await cliente.connect(); // conectar
    const libros = cliente.db("biblioteca").collection("libros");

    // ===== EJERCICIO 14 =====
    const lista = await libros.find().sort({ anio: 1 }).toArray();
    for (const libro of lista) {
      console.log(libro.titulo + " - " + libro.autor + " (" + libro.anio + ")");
    }
  } catch (error) {
    console.log("Error: " + error.message); // si algo falla, lo vemos
  } finally {
    await cliente.close(); // cerrar siempre la conexión
  }
}

main();
