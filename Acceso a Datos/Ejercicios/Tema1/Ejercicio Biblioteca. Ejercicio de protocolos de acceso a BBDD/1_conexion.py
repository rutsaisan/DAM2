import mysql.connector
conexion = mysql.connector.connect(
      host="localhost",
     port=3306,
     user="lector",
     password="lector123",
     database="biblioteca"
  )
   
print("¿Conectado?", conexion.is_connected())
   
cursor = conexion.cursor()
cursor.execute("SELECT DATABASE(), CURRENT_USER()")
fila = cursor.fetchone()
print("Base de datos:", fila[0])
print("Usuario conectado:", fila[1])
  
cursor.close()
conexion.close()
print("¿Conectado?", conexion.is_connected())