# Prepara el entorno del ejercicio ejecutando crear_base_datos.sql como root (XAMPP: root sin contrasena)
import os
import mysql.connector

carpeta = os.path.dirname(os.path.abspath(__file__))
sql = open(os.path.join(carpeta, "crear_base_datos.sql"), encoding="utf-8").read()

conexion = mysql.connector.connect(host="localhost", user="root", password="")
cursor = conexion.cursor()

for sentencia in sql.split(";"):
    lineas = [l for l in sentencia.splitlines() if l.strip() and not l.strip().startswith("--")]
    if lineas:
        cursor.execute("\n".join(lineas))

conexion.commit()
cursor.execute("SELECT * FROM accesoadatos2526.clientes")
for fila in cursor.fetchall():
    print(fila)

cursor.close()
conexion.close()
