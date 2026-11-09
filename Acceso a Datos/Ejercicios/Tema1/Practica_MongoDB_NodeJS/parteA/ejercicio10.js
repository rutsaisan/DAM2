// Ejercicio 10 - Ejemplares
print("biblioteca> db.libros.updateMany({}, { $set: { ejemplares: 1 } })");
printjson(db.libros.updateMany({}, { $set: { ejemplares: 1 } }));

print('\nbiblioteca> db.libros.updateOne({ titulo: "El Quijote" }, { $inc: { ejemplares: 2 } })');
printjson(db.libros.updateOne({ titulo: "El Quijote" }, { $inc: { ejemplares: 2 } }));

print('\nbiblioteca> db.libros.find({ titulo: "El Quijote" })');
printjson(db.libros.find({ titulo: "El Quijote" }).toArray());
