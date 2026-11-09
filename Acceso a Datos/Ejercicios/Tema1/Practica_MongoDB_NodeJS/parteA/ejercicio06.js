// Ejercicio 6 - Libros del siglo XXI
print("biblioteca> db.libros.find({ anio: { $gt: 2000 } })");
printjson(db.libros.find({ anio: { $gt: 2000 } }).toArray());
