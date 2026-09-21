NOMBRE_FICHERO = "peliculas_secuencial.txt"

def escribir_varias_peliculas():

    peliculas = [
        "Matrix,148\n",
        "Titanic,195\n",
        "Avatar,162\n"
    ]

    flujo = open(NOMBRE_FICHERO, "w")
    flujo.writelines(peliculas)
    flujo.close()

    print(f"Se ha escrito '{NOMBRE_FICHERO}' correctamente.")


def anadir_una_pelicula():


    flujo = open(NOMBRE_FICHERO, "a")

    flujo.write("Gladiator,155\n")

    flujo.close()

    print("Se ha añadido 'Gladiator' correctamente.")


def leer_todo_de_golpe():

    flujo = open(NOMBRE_FICHERO, "r")

    contenido = flujo.read()

    flujo.close()

    print(contenido)


def leer_linea_a_linea():

    flujo = open(NOMBRE_FICHERO, "r")

    linea = flujo.readline()

    while linea != "":
        print(linea.strip())
        linea = flujo.readline()

    flujo.close()


def main():
    escribir_varias_peliculas()
    anadir_una_pelicula()
    leer_todo_de_golpe()
    leer_linea_a_linea()


if __name__ == "__main__":
    main()
