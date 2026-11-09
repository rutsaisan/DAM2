// Ejercicio 8 - Libros cortos
print("biblioteca> db.libros.find({ paginas: { $lt: 300 } }, { titulo: 1, paginas: 1, _id: 0 })");
printjson(db.libros.find({ paginas: { $lt: 300 } }, { titulo: 1, paginas: 1, _id: 0 }).toArray());
