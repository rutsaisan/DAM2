class Agenda:
    def __init__(self, archivo):
        # 1. Guardar archivo dentro del objeto
        self.archivo = archivo
 
    def guardar(self, nombre, telefono):
        # 1. Abre self.archivo en modo añadir ("a")
        f = open(self.archivo, "a")
        # 2. Escribe el nombre, una coma, el teléfono y un salto de línea \n
        f.write(nombre + "," + telefono + "\n")
        # 3. Cierra el archivo
        f.close()
 
    def leer(self):
        # 1. Abre self.archivo en modo leer ("r")
        f = open(self.archivo, "r")
        # 2. Recorre el archivo línea a línea con un for
        for linea in f:
            # 3. Quita el salto de línea y córtala por la coma
            datos = linea.strip().split(",")
            # 4. Muestra: Nombre: ... - Telefono: ...
            print("Nombre:", datos[0], "- Telefono:", datos[1])
        # 5. Cierra el archivo
        f.close()

    # Reto (opcional): contar los amigos
    def contar(self):
        total = 0
        f = open(self.archivo, "r")
        for linea in f:
            total += 1
        f.close()
        return total
 
# PROGRAMA PRINCIPAL
print("--- MI AGENDA ---")
agenda = Agenda("agenda.csv")

# Guardar los tres amigos
agenda.guardar("Marta", "611222333")
agenda.guardar("Pablo", "622333444")
agenda.guardar("Lucia", "633444555")

# Leer el archivo y mostrar
agenda.leer()

# Reto opcional
print("Tengo", agenda.contar(), "amigos")