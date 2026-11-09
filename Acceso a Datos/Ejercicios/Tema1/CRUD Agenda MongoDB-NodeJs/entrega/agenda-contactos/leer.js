// Ejercicio 10 - leer.js
// CRUD Agenda MongoDB y Node.js
// Acceso a Datos - 2º DAM

const { MongoClient } = require("mongodb");
const cliente = new MongoClient("mongodb://127.0.0.1:27017");

async function main() {
  try {
    await cliente.connect();
    const contactos = cliente.db("agenda").collection("contactos");

    const lista = await contactos.find().toArray();
    console.log("Lista de contactos:");
    for (const contacto of lista) {
      console.log(contacto.nombre + " - " + contacto.telefono + " (" + contacto.ciudad + ")");
    }
    console.log("Total: " + lista.length + " contactos");
  } catch (error) {
    console.log("Error: " + error.message);
  } finally {
    await cliente.close();
  }
}

main();
