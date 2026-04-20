# Base de datos del proyecto

## Índice
- [Base de datos del proyecto](#base-de-datos-del-proyecto)
  - [Índice](#índice)
  - [Introducción](#introducción)
  - [Elección de la base de datos](#elección-de-la-base-de-datos)
    - [MySQL](#mysql)
      - [Características principales](#características-principales)
      - [Ventajas](#ventajas)
      - [Desventajas](#desventajas)
    - [MariaDB](#mariadb)
      - [Características principales](#características-principales-1)
      - [Ventajas](#ventajas-1)
      - [Desventajas](#desventajas-1)
  - [Definición de tablas y relaciones](#definición-de-tablas-y-relaciones)

## Introducción

Este documento presenta la comparación y elección de la base de datos para el proyecto. Se evaluarán sus características principales, ventajas y desventajas para determinar cuál es la mejor opción para nuestro proyecto. 

Además, se discutirá la importancia de la base de datos en el contexto del proyecto y cómo su elección puede afectar el rendimiento, la escalabilidad y la seguridad de la aplicación. 

Se definirán las tablas necesarias para almacenar la información, además de las relaciones entre ellas, para garantizar una estructura de datos eficiente y escalable. También se considerarán aspectos como la facilidad de uso, la compatibilidad con otras tecnologías utilizadas en el proyecto y el soporte disponible para cada base de datos.

## Elección de la base de datos
De las posibles opciones de bases de datos, se han seleccionado MySQL y MariaDB para su evaluación. Ambas son bases de datos relacionales ampliamente utilizadas, con características similares, pero con algunas diferencias clave que pueden influir en el rendimiento y la escalabilidad del proyecto.

### MySQL

MySQL es una base de datos relacional, con una capacidad de escalabilidad y rendimiento adecuados. A continuación, se presentan algunas de sus características principales, ventajas y desventajas:

#### Características principales
- Es una base de datos relacional ampliamente utilizada.
- Tiene una buena capacidad de escalabilidad.
- Cuenta con una gran comunidad de soporte.
#### Ventajas
- Es de código abierto y gratuito.
- Es compatible con una gran cantidad de sistemas operativos y lenguajes de programación.
- Tiene una buena capacidad de escalabilidad y rendimiento.
- Es ampliamente utilizado, lo que facilita la búsqueda de recursos y soporte.
- Ofrece una amplia gama de herramientas y complementos para mejorar su funcionalidad.

#### Desventajas
- Puede tener problemas de rendimiento en entornos de alta carga.
- Algunas funcionalidades avanzadas están disponibles solo en versiones pagadas.
- Ofrece una infraestructura más pobre en comparación con otras bases de datos, como MariaDB, lo que puede afectar su rendimiento y escalabilidad en situaciones de alta carga.

### MariaDB
MariaDB es un fork de MySQL, creada por los desarrolladores originales de MySQL. A continuación, se presentan algunas de sus características principales, ventajas y desventajas:

#### Características principales
- Es una base de datos relacional, similar a MySQL.
- Tiene una buena capacidad de escalabilidad y rendimiento.
- Es compatible con MySQL, lo que facilita la migración.
- Cuenta con una gran comunidad de soporte.

#### Ventajas
- Es compatible con muchos motores de almacenamiento.
- Es compatible con MySQL, lo que facilita la migración.
- Tiene una buena capacidad de escalabilidad y rendimiento.
- En situaciones de carga alta, ofrece un mejor rendimiento que MySQL.
- Puede manejar mayor número de conexiones simultáneas que MySQL.
- Posee una mejor infraestructura de seguridad, almacenamiento y escaalabilidad en comparación con MySQL.

#### Desventajas
- Puede tener problemas de compatibilidad con algunas versiones de MySQL.
- Algunas funcionalidades avanzadas están disponibles solo en versiones pagadas.
- Al ser un fork de MySQL, puede tener problemas de compatibilidad con algunas aplicaciones que dependen de MySQL.

## Definición de tablas y relaciones
