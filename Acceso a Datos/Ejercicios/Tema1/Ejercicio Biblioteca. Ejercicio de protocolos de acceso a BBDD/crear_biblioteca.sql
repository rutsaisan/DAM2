1  SET NAMES utf8mb4;
 2  CREATE DATABASE IF NOT EXISTS biblioteca;
 3  CREATE USER IF NOT EXISTS 'lector'@'localhost' IDENTIFIED BY 'lector123';
 4  GRANT ALL PRIVILEGES ON biblioteca.* TO 'lector'@'localhost';
 5  USE biblioteca;
 6  CREATE TABLE IF NOT EXISTS libros (
 7      id INT AUTO_INCREMENT PRIMARY KEY,
 8      titulo VARCHAR(100) NOT NULL,
 9      autor VARCHAR(50)
10  );
11  INSERT INTO libros (titulo, autor) VALUES 
    ('El Quijote', 'Cervantes'),
    ('La Regenta', 'Clarín'),
    ('Niebla', 'Unamuno');