// Ejercicio 9 - Prestar un libro
print('biblioteca> db.libros.updateOne({ titulo: "El principito" }, { $set: { disponible: false } })');
printjson(db.libros.updateOne({ titulo: "El principito" }, { $set: { disponible: false } }));

print("\nbiblioteca> db.libros.find({ disponible: false })");
printjson(db.libros.find({ disponible: false }).toArray());
