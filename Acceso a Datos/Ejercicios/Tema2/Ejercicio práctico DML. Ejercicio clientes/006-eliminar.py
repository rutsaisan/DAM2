import mysql.connector

conexion = mysql.connector.connect(
    host="localhost",
    user="accesoadatos2526",
    password="Accesoadatos2526$",
    database="accesoadatos2526"
)

cursor = conexion.cursor()

# Eliminar el cliente
cursor.execute('DELETE FROM clientes WHERE Identificador = 4')

conexion.commit()

cursor.close()
conexion.close()
