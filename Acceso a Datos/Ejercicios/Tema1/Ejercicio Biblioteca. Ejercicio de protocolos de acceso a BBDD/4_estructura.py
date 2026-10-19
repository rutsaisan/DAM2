import mysql.connector
  
conexion = mysql.connector.connect(
    host="localhost", user="lector", password="lector123", database="biblioteca"
)
cursor = conexion.cursor()
   
cursor.execute("DROP TABLE IF EXISTS socios")
cursor.execute("CREATE TABLE socios (id INT PRIMARY KEY, nombre VARCHAR(50))")
cursor.execute("ALTER TABLE socios ADD COLUMN telefono VARCHAR(15)")
print("Tabla socios creada y modificada")  

cursor.execute("SHOW TABLES")
for fila in cursor.fetchall():
    print("Tabla:", fila[0])
 
cursor.execute("DESCRIBE socios")
for columna in cursor.fetchall():
    print("Columna:", columna[0], "| Tipo:", columna[1])
  
cursor.execute("DROP TABLE socios")
print("Tabla socios borrada")
  
cursor.close()
conexion.close()