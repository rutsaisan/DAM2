import json

NOMBRE_FICHERO = "biblioteca.dat"

def crear_lista_libros():
    libros = [
        {"titulo": "Alas de Sangre", "autor": "Rebecca Yarros", "anio": "2023", "paginas": "736"},
        {"titulo": "Antes de Diciembre", "autor": "Joanna Marcus", "anio": "2021", "paginas": "446"},
    ]
    return libros

def serializar_libros(libros):
    cadena_json = json.dumps(libros,ensure_ascii=False, indent=4)
    print("Cadena JSON:")
    print (cadena_json)
    print("Tipo de la cadena:", type(cadena_json))
    return cadena_json

    pass

def guardar_en_fichero(cadena):
    with open(NOMBRE_FICHERO,"w", encoding="utf-8") as fichero:
        fichero.write(cadena)

    pass

def main():
    libros = crear_lista_libros()
    print("Lista Original:")
    print(libros)
    print("-"*40)
    print(f"Datos guardados correctamente en '{NOMBRE_FICHERO}'.")

    pass

if __name__ == "__main__":
    main()