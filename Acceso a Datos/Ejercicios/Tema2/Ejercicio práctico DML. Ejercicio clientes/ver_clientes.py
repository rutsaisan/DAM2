# Muestra el resultado de SELECT * FROM clientes; (comprobacion despues de cada programa)
import mysql.connector

conexion = mysql.connector.connect(
    host="localhost",
    user="accesoadatos2526",
    password="Accesoadatos2526$",
    database="accesoadatos2526"
)

cursor = conexion.cursor()
cursor.execute("SELECT * FROM clientes;")
print("SELECT * FROM clientes;")
print("Identificador | nombre | apellidos | email")
for fila in cursor.fetchall():
    print(fila)

cursor.close()
conexion.close()
