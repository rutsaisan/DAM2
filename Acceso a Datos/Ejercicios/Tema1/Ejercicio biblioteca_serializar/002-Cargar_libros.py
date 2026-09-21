import json

NOMBRE_FICHERO = "biblioteca.dat"

def leer_fichero():

    with open(NOMBRE_FICHERO, "r", encoding="utf-8") as fichero:
        lineas = fichero.readlines()
        primera_linea = lineas[0]
    return primera_linea

def deserializar_libros(linea):

    libros = json.loads(linea)
    return libros

def main():
    linea_leida = leer_fichero()
    print("Texto leído del fichero:")
    print(linea_leida)
    print("Tipo del texto leído:", type(linea_leida))
    print("-" * 40)
    
    libros_reconstruidos = deserializar_libros(linea_leida)
    print("Lista de libros reconstruida:")
    print(libros_reconstruidos)
    print("Tipo de la lista reconstruida:", type(libros_reconstruidos))

if __name__ == "__main__":
    main()