// Ejercicio 12 - borrar.js
// CRUD Agenda MongoDB y Node.js
// Acceso a Datos - 2º DAM

const { MongoClient } = require("mongodb");
const cliente = new MongoClient("mongodb://127.0.0.1:27017");

async function main() {
  try {
    await cliente.connect();
    const contactos = cliente.db("agenda").collection("contactos");

    const resultado = await contactos.deleteOne({ nombre: "Sara Díaz" });
    console.log("Contactos borrados: " + resultado.deletedCount);
    const total = await contactos.countDocuments();
    console.log("Quedan " + total + " contactos en la agenda.");
  } catch (error) {
    console.log("Error: " + error.message);
  } finally {
    await cliente.close();
  }
}

main();
