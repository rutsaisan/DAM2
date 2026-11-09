// Ejercicio 9 - crear.js
// CRUD Agenda MongoDB y Node.js
// Acceso a Datos - 2º DAM

const { MongoClient } = require("mongodb");
const cliente = new MongoClient("mongodb://127.0.0.1:27017");

async function main() {
  try {
    await cliente.connect();
    const contactos = cliente.db("agenda").collection("contactos");

    const nuevo = { nombre: "Sara Díaz", telefono: "622444555", ciudad: "Alicante" };
    const resultado = await contactos.insertOne(nuevo);
    console.log("Contacto creado con id: " + resultado.insertedId);
    const total = await contactos.countDocuments();
    console.log("Ahora hay " + total + " contactos en la agenda.");
  } catch (error) {
    console.log("Error: " + error.message);
  } finally {
    await cliente.close();
  }
}

main();
