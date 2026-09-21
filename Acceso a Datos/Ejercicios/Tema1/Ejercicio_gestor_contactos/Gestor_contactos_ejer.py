
import csv
import json


def leer_csv(ruta_csv):

    contactos = []

    with open(ruta_csv, mode="r", encoding="utf-8", newline="") as archivo_csv:
        lector = csv.DictReader(archivo_csv)  

        for fila in lector:
            contacto = {
                "nombre": fila["nombre"],
                "apellidos": fila["apellidos"],
                "telefono": fila["telefono"],
            }
            contactos.append(contacto)

    return contactos


def guardar_json(contactos, ruta_json):

    with open(ruta_json, mode="w", encoding="utf-8") as archivo_json:
        json.dump(contactos, archivo_json, indent=4, ensure_ascii=False)


def escribir_log(contactos, ruta_log):

    with open(ruta_log, mode="w", encoding="utf-8") as archivo_log:
        for contacto in contactos:
            linea = f"Contacto añadido: {contacto['nombre']} {contacto['apellidos']}\n"
            archivo_log.write(linea)


def contar_lineas_log(ruta_log):
    
    with open(ruta_log, mode="r", encoding="utf-8") as archivo_log:
        lineas = archivo_log.readlines()
    return len(lineas)


def main():
    ruta_csv = "datos.csv"
    ruta_json = "contactos.json"
    ruta_log = "log.txt"

    
    contactos = leer_csv(ruta_csv)
    print(f"Se han leído {len(contactos)} contactos desde '{ruta_csv}'.")

    
    guardar_json(contactos, ruta_json)
    print(f"Contactos guardados en '{ruta_json}'.")

    
    escribir_log(contactos, ruta_log)
    print(f"Registro de actividad escrito en '{ruta_log}'.")

    
    total = contar_lineas_log(ruta_log)
    print(f"\nTotal de contactos procesados según el log: {total}")


if __name__ == "__main__":
    main()