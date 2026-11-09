// Ejercicio 3 - Llenar la estantería
print("biblioteca> db.libros.insertMany([ ...5 libros... ])");
printjson(db.libros.insertMany([
  { titulo: "Cien años de soledad", autor: "Gabriel García Márquez", anio: 1967, genero: "novela", paginas: 471, disponible: true },
  { titulo: "La sombra del viento", autor: "Carlos Ruiz Zafón", anio: 2001, genero: "misterio", paginas: 576, disponible: true },
  { titulo: "El principito", autor: "Antoine de Saint-Exupéry", anio: 1943, genero: "infantil", paginas: 96, disponible: true },
  { titulo: "Patria", autor: "Fernando Aramburu", anio: 2016, genero: "novela", paginas: 648, disponible: true },
  { titulo: "Harry Potter y la piedra filosofal", autor: "J. K. Rowling", anio: 1997, genero: "fantasía", paginas: 256, disponible: true }
]));

print("\nbiblioteca> db.libros.find({}, { titulo: 1, autor: 1, _id: 0 })");
printjson(db.libros.find({}, { titulo: 1, autor: 1, _id: 0 }).toArray());
