// Ejercicio 18 - estadisticas.js
// Práctica MongoDB y Node.js
// Acceso a Datos - 2º DAM

const { MongoClient } = require("mongodb"); // cargar la librería
const cliente = new MongoClient("mongodb://127.0.0.1:27017");

async function main() {
  try {
    await cliente.connect(); // conectar
    const libros = cliente.db("biblioteca").collection("libros");

    // ===== EJERCICIO 18 =====
    const total = await libros.countDocuments();
    const disponibles = await libros.countDocuments({ disponible: true });
    const prestados = await libros.countDocuments({ disponible: false });
    const masLargo = await libros.findOne({}, { sort: { paginas: -1 } });

    console.log("===== ESTADÍSTICAS DE LA BIBLIOTECA =====");
    console.log("Total de libros: " + total);
    console.log("Disponibles: " + disponibles);
    console.log("Prestados: " + prestados);
    console.log("Libro con más páginas: " + masLargo.titulo + " (" + masLargo.paginas + " páginas)");
  } catch (error) {
    console.log("Error: " + error.message); // si algo falla, lo vemos
  } finally {
    await cliente.close(); // cerrar siempre la conexión
  }
}

main();
