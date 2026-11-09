// Ejercicio 11 - Retirar un libro
print('biblioteca> db.libros.deleteOne({ titulo: "Harry Potter y la piedra filosofal" })');
printjson(db.libros.deleteOne({ titulo: "Harry Potter y la piedra filosofal" }));

print("\nbiblioteca> db.libros.countDocuments()");
print(db.libros.countDocuments());
print("\nbiblioteca> exit");
