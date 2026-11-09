// Ejercicio 15 - insertar.js
// Práctica MongoDB y Node.js
// Acceso a Datos - 2º DAM

const { MongoClient } = require("mongodb"); // cargar la librería
const cliente = new MongoClient("mongodb://127.0.0.1:27017");

async function main() {
  try {
    await cliente.connect(); // conectar
    const libros = cliente.db("biblioteca").collection("libros");

    // ===== EJERCICIO 15 =====
    const resultado = await libros.insertOne({
      titulo: "Nada",
      autor: "Carmen Laforet",
      anio: 1945,
      genero: "novela",
      paginas: 288,
      disponible: true,
      ejemplares: 1
    });
    console.log("Libro insertado con id: " + resultado.insertedId);
  } catch (error) {
    console.log("Error: " + error.message); // si algo falla, lo vemos
  } finally {
    await cliente.close(); // cerrar siempre la conexión
  }
}

main();
