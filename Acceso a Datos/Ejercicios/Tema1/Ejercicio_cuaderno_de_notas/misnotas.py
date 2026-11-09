import csv   # para leer ficheros CSV (paso 6)
import json  # para serializar y deserializar (pasos 7 y 8)
import os    # para ver los ficheros de la carpeta (paso 11)
 
# Nombres de los ficheros (en MAYÚSCULAS porque no cambian nunca)
NOMBRE_NOTAS = "notas.csv"
NOMBRE_JSON = "notas.json"
NOMBRE_BINARIO = "total.bin"
 
 
# ---------- PASO 1 ----------
def crear_fichero_notas():
    # 1. Lista con las tres líneas (fíjate en el \n del final de cada una)
    lineas = ["Ana,8\n", "Luis,6\n", "Marta,9\n"]
    # 2. Abre NOMBRE_NOTAS en modo escritura
    fichero = open(NOMBRE_NOTAS, "w")
    # 3. Escribe la lista entera de golpe
    fichero.writelines(lineas)
    # 4. Cierra el fichero
    fichero.close()
    print("Fichero", NOMBRE_NOTAS, "creado con 3 alumnos.")
 
 
# ---------- PASO 2 ----------
class Cuaderno:
    # Constructor: se ejecuta al crear el objeto
    def __init__(self, archivo):
        # Guarda el nombre del archivo dentro del objeto
        self.archivo = archivo
 
    # Añade UN alumno al final del archivo, sin borrar lo que había
    def anadir(self, nombre, nota):
        # 1. Abre self.archivo en modo añadir
        fichero = open(self.archivo, "a")
        # 2. Escribe nombre, coma, nota (como texto) y salto de línea
        fichero.write(nombre + "," + str(nota) + "\n")
        # 3. Cierra el fichero
        fichero.close()
        print("Añadido:", nombre, "con un", nota)
 
 
# ---------- PASO 3 ----------
def leer_todo():
    # 1. Abre NOMBRE_NOTAS en modo lectura
    fichero = open(NOMBRE_NOTAS, "r")
    # 2. Lee TODO el contenido de una vez
    contenido = fichero.read()
    # 3. Cierra el fichero y muestra lo leído
    fichero.close()
    print(contenido)
 
 
# ---------- PASO 4 ----------
def leer_linea_a_linea():
    fichero = open(NOMBRE_NOTAS, "r")
    # 1. Lee la primera línea
    linea = fichero.readline()
    # 2. Repite mientras la línea NO esté vacía
    while linea != "":
        # 3. Quita el \n con strip() y corta por la coma con split(",")
        partes = linea.strip().split(",")
        # partes[0] es el nombre y partes[1] es la nota
        print("Alumno:", partes[0], "- Nota:", partes[1])
        # 4. Lee la siguiente línea (¡no lo olvides!)
        linea = fichero.readline()
    fichero.close()
 
 
# ---------- PASO 5 ----------
def probar_seek_tell():
    fichero = open(NOMBRE_NOTAS, "r")
    # 1. Lee la primera línea
    primera = fichero.readline()
    # 2. Pregunta en qué posición ha quedado el puntero
    posicion = fichero.tell()
    print("He leído:", primera.strip(), "- puntero en:", posicion)
    # 3. Vuelve al principio del fichero (posición 0)
    fichero.seek(0)
    print("Vuelvo al principio y leo otra vez:", fichero.readline().strip())
    # 4. Salta a la posición que guardaste en el punto 2
    fichero.seek(posicion)
    print("Salto a", posicion, "y leo:", fichero.readline().strip())
    fichero.close()
 
 
# ---------- PASO 6 ----------
def cargar_con_csv():
    # 1. Lista vacía donde iremos metiendo los alumnos
    alumnos = []
    fichero = open(NOMBRE_NOTAS, "r")
    # 2. Crea el lector de csv
    lector = csv.reader(fichero)
    for fila in lector:
        # fila es una lista, por ejemplo ['Ana', '8']
        # 3. Crea el diccionario (la nota, pásala a número)
        alumno = {"nombre": fila[0], "nota": int(fila[1])}
        # 4. Mete el diccionario en la lista
        alumnos.append(alumno)
    fichero.close()
    # 5. Devuelve la lista a quien llamó a la función
    return alumnos
 
 
# ---------- PASO 7 ----------
def guardar_json(alumnos):
    # 1. Convierte la lista en un texto JSON
    texto = json.dumps(alumnos)
    # 2. Comprueba los tipos: antes list, después str
    print("Tipo de alumnos:", type(alumnos))
    print("Tipo de texto: ", type(texto))
    # 3. Guarda el texto en el fichero NOMBRE_JSON
    fichero = open(NOMBRE_JSON, "w")
    fichero.write(texto)
    fichero.close()
    print("Guardado en", NOMBRE_JSON)
 
 
# ---------- PASO 8 ----------
def cargar_json():
    fichero = open(NOMBRE_JSON, "r")
    # 1. readlines() da una LISTA de líneas; coge la primera
    linea = fichero.readlines()[0]
    fichero.close()
    print("Tipo de lo leído:", type(linea))
    # 2. Convierte el texto JSON otra vez en una lista de Python
    alumnos = json.loads(linea)
    print("Tipo tras json.loads:", type(alumnos))
    return alumnos
 
 
# ---------- PASO 9 ----------
def leer_fichero_seguro(nombre):
    fichero = None
    try:
        # Aquí va lo que puede fallar
        fichero = open(nombre, "r")
        print("Contenido de", nombre + ":")
        print(fichero.read())
    except FileNotFoundError:
        # El fichero no existe
        print("Error: el fichero", nombre, "no existe.")
    except PermissionError:
        print("Error: no tienes permiso para leer", nombre)
    except IOError:
        print("Error: hubo un problema al leer", nombre)
    finally:
        # Esto se ejecuta SIEMPRE, haya error o no
        if fichero is not None:
            fichero.close()
        print("Fin de la lectura de", nombre)
 
 
# ---------- PASO 10 ----------
def guardar_total_binario(total):
    # 1. Abre el fichero en modo escritura BINARIA
    fichero = open(NOMBRE_BINARIO, "wb")
    # 2. Convierte el número en bytes y escríbelo
    fichero.write(bytes([total]))
    fichero.close()
    # 3. Ábrelo en modo lectura BINARIA y lee
    fichero = open(NOMBRE_BINARIO, "rb")
    datos = fichero.read()
    fichero.close()
    # 4. datos[0] es el primer byte, ya como número
    print("Número guardado en binario:", datos[0])
 
 
# ---------- PASO 11 ----------
def listar_ficheros():
    # os.listdir(".") da la lista de lo que hay en la carpeta actual
    for nombre in os.listdir("."):
        # Solo mostramos nuestros ficheros
        if nombre.startswith("notas") or nombre.endswith(".bin"):
            print("-", nombre)
 
 
def main():
    print("=== MI CUADERNO DE NOTAS ===")
 
    print("\n--- PASO 1: crear el fichero ---")
    crear_fichero_notas()
 
    print("\n--- PASO 2: añadir alumnos con la clase Cuaderno ---")
    cuaderno = Cuaderno(NOMBRE_NOTAS)
    cuaderno.anadir("Pablo", 7)
    cuaderno.anadir("Lucia", 10)
 
    print("\n--- PASO 3: leer todo de golpe ---")
    leer_todo()
 
    print("--- PASO 4: leer línea a línea ---")
    leer_linea_a_linea()
 
    print("\n--- PASO 5: seek y tell ---")
    probar_seek_tell()
 
    print("\n--- PASO 6: leer con csv ---")
    alumnos = cargar_con_csv()
    print(alumnos)
 
    print("\n--- PASO 7: guardar en JSON ---")
    guardar_json(alumnos)
 
    print("\n--- PASO 8: cargar el JSON ---")
    recuperados = cargar_json()
    for alumno in recuperados:
        print(alumno["nombre"], "tiene un", alumno["nota"])
 
    print("\n--- PASO 9: excepciones ---")
    leer_fichero_seguro(NOMBRE_NOTAS)
    leer_fichero_seguro("no_existe.txt")
 
    print("\n--- PASO 10: binario ---")
    guardar_total_binario(len(recuperados))
 
    print("\n--- PASO 11: ficheros creados ---")
    listar_ficheros()
 
 
# Solo se ejecuta main() si lanzamos este archivo directamente
if __name__ == "__main__":
    main()