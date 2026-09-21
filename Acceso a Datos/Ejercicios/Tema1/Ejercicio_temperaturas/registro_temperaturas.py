NOMBRE_FICHERO_TEMPERATURAS = "temperaturas.txt"
NOMBRE_FICHERO_CONTADOR = "contador.bin"

def escribir_temperaturas():
    f = open(NOMBRE_FICHERO_TEMPERATURAS,"w")
    f.write("18.5\n")
    f.write("21.0\n")
    f.write("19.2\n")
    f.close()
    
    pass

def leer_temperaturas():
    f = open(NOMBRE_FICHERO_TEMPERATURAS,"r")
    contenido = f.read()
    f.close()

    print("----Contenido de temperaturas.txt----")
    print(contenido)

    pass

def saltar_primera_temperatura():
    f = open(NOMBRE_FICHERO_TEMPERATURAS,"r")

    f.readline()           
    posicion = f.tell()    
        
    f.seek(0)              
    f.seek(posicion)       
        
    resto_contenido = f.read()
    f.close()

    print("--- Resto de temperaturas ---")
    print(resto_contenido)
    
    pass

def comprobar_fichero_configuracion():
    try:
        f = open("configuracion.txt","r")
        f.close()

    except FileNotFoundError:
        print("Aviso: El fichero 'configuracion.txt' no existe. No se pudo abrir.")

    pass

def guardar_numero_registros():
    f = open(NOMBRE_FICHERO_CONTADOR,"wb")
    f.write(bytes([3]))
    f.close()

    f = open(NOMBRE_FICHERO_CONTADOR,"rb")
    datos = f.read()
    f.close

    numero = datos[0]
    print(f"--- Fichero binario ---")
    print(f"Número guardado: {numero}")

    pass

def main():

    escribir_temperaturas()
    leer_temperaturas()
    saltar_primera_temperatura()
    comprobar_fichero_configuracion()
    guardar_numero_registros()

    
    pass

if __name__ == "__main__":
    main()


