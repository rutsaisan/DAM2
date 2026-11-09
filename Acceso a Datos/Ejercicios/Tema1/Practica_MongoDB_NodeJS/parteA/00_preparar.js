// Deja la colección biblioteca.libros vacía para empezar la Parte A.
// Si ya había libros de un intento anterior, NO se borran: se guardan en otra colección.
const bib = db.getSiblingDB("biblioteca");
if (bib.getCollectionNames().includes("libros")) {
  const copia = "libros_copia_" + new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  bib.libros.renameCollection(copia);
  print("Se ha guardado la colección anterior como biblioteca." + copia);
}
print("Colección biblioteca.libros lista para empezar.");
