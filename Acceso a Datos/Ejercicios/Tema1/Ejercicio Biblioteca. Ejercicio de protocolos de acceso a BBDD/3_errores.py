import mysql.connector
  
try:
   conexion = mysql.connector.connect(
         host="localhost", user="lector", password="contrasenaincorrecta", database="biblioteca"
     )
except mysql.connector.Error as error:
    print("Error al conectar:", error.errno, error.msg)
  
conexion = mysql.connector.connect(
 host="localhost", user="lector", password="lector123", database="biblioteca"
 )
cursor = conexion.cursor()
try:
    cursor.execute("SELECT * FROM revistas")
except mysql.connector.ProgrammingError as error:
    print("Error en la sentencia:", error.errno, error.msg)

cursor.close()
conexion.close()