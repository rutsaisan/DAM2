// Ejercicio 7 - Listado ordenado
print("biblioteca> db.libros.find({}, { titulo: 1, autor: 1, _id: 0 }).sort({ anio: 1 })");
printjson(db.libros.find({}, { titulo: 1, autor: 1, _id: 0 }).sort({ anio: 1 }).toArray());
