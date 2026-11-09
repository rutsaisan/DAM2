-- Preparación del entorno del ejercicio (base de datos, usuario y tabla clientes)
-- Ejecutar como root en MySQL/MariaDB (XAMPP)

CREATE DATABASE IF NOT EXISTS accesoadatos2526;

CREATE USER IF NOT EXISTS 'accesoadatos2526'@'localhost' IDENTIFIED BY 'Accesoadatos2526$';
GRANT ALL PRIVILEGES ON accesoadatos2526.* TO 'accesoadatos2526'@'localhost';
FLUSH PRIVILEGES;

USE accesoadatos2526;

CREATE TABLE IF NOT EXISTS clientes (
  Identificador INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  PRIMARY KEY (Identificador)
);

-- Clientes de ejemplo (identificadores 1 y 2)
INSERT INTO clientes VALUES
  (NULL, "Maria", "Sanchez Perez", "maria@sanchezperez.com"),
  (NULL, "Pedro", "Gomez Diaz", "pedro@gomezdiaz.com");
