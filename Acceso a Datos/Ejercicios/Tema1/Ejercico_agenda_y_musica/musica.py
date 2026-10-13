import os
 
def mostrar(carpeta, espacios):
    # 1. Recorre con un for los nombres ordenados alfabéticamente
    for nombre in sorted(os.listdir(carpeta)):
        # 2. Escribe cada nombre con sus espacios delante
        print(espacios + nombre)
        
        # 3. Forma la ruta completa
        ruta = os.path.join(carpeta, nombre)
        
        # 4. Si la ruta es una carpeta, llama otra vez a mostrar con 4 espacios más
        if os.path.isdir(ruta):
            mostrar(ruta, espacios + "    ")
 
# PROGRAMA PRINCIPAL
print("--- MI MUSICA ---")

# 2. Crea las carpetas necesarias
os.makedirs("mi_musica/rock/clasicos", exist_ok=True)
os.makedirs("mi_musica/pop", exist_ok=True)

# 3. Crea tres archivos vacíos (usando open con "w" y cerrándolo de inmediato)
open("mi_musica/lista.txt", "w").close()
open("mi_musica/rock/clasicos/queen.mp3", "w").close()
open("mi_musica/pop/abba.mp3", "w").close()

# 4. Llama a la función mostrando la carpeta principal
mostrar("mi_musica", "")