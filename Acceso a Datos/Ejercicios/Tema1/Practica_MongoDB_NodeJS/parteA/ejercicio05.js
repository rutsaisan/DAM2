// Ejercicio 5 - Solo novelas
print('biblioteca> db.libros.find({ genero: "novela" })');
const novelas = db.libros.find({ genero: "novela" }).toArray();
printjson(novelas);
print("\nAparecen " + novelas.length + " novelas.");
