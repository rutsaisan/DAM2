// Ejercicio 2 - Tu primer libro
print("test> use biblioteca");
db = db.getSiblingDB("biblioteca");
print("switched to db biblioteca\n");

print('biblioteca> db.libros.insertOne({ titulo: "El Quijote", autor: "Miguel de Cervantes", anio: 1605, genero: "novela", paginas: 1250, disponible: true })');
printjson(db.libros.insertOne({ titulo: "El Quijote", autor: "Miguel de Cervantes", anio: 1605, genero: "novela", paginas: 1250, disponible: true }));

print("\nbiblioteca> db.libros.find()");
printjson(db.libros.find().toArray());
