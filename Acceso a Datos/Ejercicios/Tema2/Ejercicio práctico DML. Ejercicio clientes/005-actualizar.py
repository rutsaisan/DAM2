import mysql.connector

conexion = mysql.connector.connect(
    host="localhost",
    user="accesoadatos2526",
    password="Accesoadatos2526$",
    database="accesoadatos2526"
)

cursor = conexion.cursor()

# Cambiar el nombre del cliente
cursor.execute('UPDATE clientes SET nombre = "Ana Maria" WHERE Identificador = 4')

conexion.commit()

cursor.close()
conexion.close()
