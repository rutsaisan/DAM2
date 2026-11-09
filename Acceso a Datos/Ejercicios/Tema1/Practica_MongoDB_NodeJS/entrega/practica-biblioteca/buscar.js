// Ejercicio 16 - buscar.js
// Práctica MongoDB y Node.js
// Acceso a Datos - 2º DAM

const { MongoClient } = require("mongodb"); // cargar la librería
const cliente = new MongoClient("mongodb://127.0.0.1:27017");

async function main() {
  try {
    await cliente.connect(); // conectar
    const libros = cliente.db("biblioteca").collection("libros");

    // ===== EJERCICIO 16 =====
    const genero = "novela"; // cambia este valor (por ejemplo "infantil") y vuelve a ejecutar
    const lista = await libros.find({ genero: genero }).toArray();
    console.log("Libros del género " + genero + ":");
    for (const libro of lista) {
      console.log("  - " + libro.titulo);
    }
    console.log("Encontrados: " + lista.length);
  } catch (error) {
    console.log("Error: " + error.message); // si algo falla, lo vemos
  } finally {
    await cliente.close(); // cerrar siempre la conexión
  }
}

main();
