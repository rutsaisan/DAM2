import mysql.connector

# Paso 1. Copia los datos
libros = [
    {"titulo": "Don Quijote", "paginas": 863, "generos": ["novela", "aventuras", "humor"]},
    {"titulo": "Platero y yo", "paginas": 144, "generos": ["poesía", "infantil"]},
    {"titulo": "Marianela", "paginas": 256, "generos": ["novela"]}
]

# Paso 3. Conéctate a la base de datos
conn = mysql.connector.connect(
    host="localhost",
    user="desfase",
    password="desfase",
    database="desfase"
)
cursor = conn.cursor()

# Paso 4. Borra las tablas si ya existen (orden: hija -> madre)
cursor.execute("DROP TABLE IF EXISTS libros_generos")
cursor.execute("DROP TABLE IF EXISTS libros")

# Paso 5. Crea la tabla libros
cursor.execute("""
    CREATE TABLE libros (
        Identificador INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255),
        paginas INT
    )
""")

# Paso 6. Crea la tabla para los géneros
cursor.execute("""
    CREATE TABLE libros_generos (
        Identificador INT AUTO_INCREMENT PRIMARY KEY,
        libros_id INT,
        valor VARCHAR(255),
        FOREIGN KEY (libros_id) REFERENCES libros(Identificador)
    )
""")

# Paso 7. Guarda los libros y sus géneros
for libro in libros:
    # Insertar el libro
    cursor.execute(
        "INSERT INTO libros (titulo, paginas) VALUES (%s, %s)", 
        (libro["titulo"], libro["paginas"])
    )
    # Recuperar el ID automático generado por MySQL
    id_libro = cursor.lastrowid
    
    # Insertar cada género asociado a ese ID
    for genero in libro["generos"]:
        cursor.execute(
            "INSERT INTO libros_generos (libros_id, valor) VALUES (%s, %s)", 
            (id_libro, genero)
        )

# Confirmar los cambios
conn.commit()

# Paso 8. Recupera los datos
recuperados = []
cursor.execute("SELECT Identificador, titulo, paginas FROM libros")
filas_libros = cursor.fetchall()

for fila in filas_libros:
    id_libro = fila[0]
    titulo = fila[1]
    paginas = fila[2]
    
    # Buscar los géneros de este libro en concreto
    cursor.execute("SELECT valor FROM libros_generos WHERE libros_id = %s", (id_libro,))
    filas_generos = cursor.fetchall()
    
    # Extraer el texto de la tupla devuelta por MySQL (fila_genero[0])
    generos = [g[0] for g in filas_generos]
    
    # Reconstruir la ficha del libro
    recuperados.append({
        "titulo": titulo,
        "paginas": paginas,
        "generos": generos
    })

print("¿La lista recuperada es idéntica a la original?:", recuperados == libros)
print("\nLista recuperada:")
print(recuperados)

# Reto extra (opcional). ¿Qué libros son novelas?
print("\n--- Reto Extra: Libros que son novelas ---")
cursor.execute("""
    SELECT libros.titulo 
    FROM libros 
    JOIN libros_generos ON libros.Identificador = libros_generos.libros_id 
    WHERE libros_generos.valor = %s
""", ("novela",))

novelas = cursor.fetchall()
for novela in novelas:
    print(novela[0])

# Cerrar la conexión
conn.close()