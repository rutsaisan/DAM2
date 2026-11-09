// Ejercicio 17 - prestar.js
// Práctica MongoDB y Node.js
// Acceso a Datos - 2º DAM

const { MongoClient } = require("mongodb"); // cargar la librería
const cliente = new MongoClient("mongodb://127.0.0.1:27017");

async function main() {
  try {
    await cliente.connect(); // conectar
    const libros = cliente.db("biblioteca").collection("libros");

    // ===== EJERCICIO 17 =====
    const resultado = await libros.updateOne(
      { titulo: "La sombra del viento" },
      { $set: { disponible: false } }
    );
    console.log("Documentos modificados: " + resultado.modifiedCount);

    const disponibles = await libros.find({ disponible: true }).toArray();
    console.log("Libros que siguen disponibles:");
    for (const libro of disponibles) {
      console.log("  - " + libro.titulo);
    }
  } catch (error) {
    console.log("Error: " + error.message); // si algo falla, lo vemos
  } finally {
    await cliente.close(); // cerrar siempre la conexión
  }
}

main();
