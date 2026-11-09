// Ejercicio 11 - actualizar.js
// CRUD Agenda MongoDB y Node.js
// Acceso a Datos - 2º DAM

const { MongoClient } = require("mongodb");
const cliente = new MongoClient("mongodb://127.0.0.1:27017");

async function main() {
  try {
    await cliente.connect();
    const contactos = cliente.db("agenda").collection("contactos");

    const resultado = await contactos.updateOne(
      { nombre: "Marta Ruiz" },
      { $set: { ciudad: "Castellón" } }
    );
    console.log("Contactos modificados: " + resultado.modifiedCount);
    const marta = await contactos.findOne({ nombre: "Marta Ruiz" });
    console.log(marta.nombre + " ahora vive en: " + marta.ciudad);
  } catch (error) {
    console.log("Error: " + error.message);
  } finally {
    await cliente.close();
  }
}

main();
