import { Esculturas, Visitantes, Eventos, Artistas, Imagenes } from './clases.js';
import mysql from 'mysql2';
// Esto de abajo es para usar el .env para guardar la contraseña de la database
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });


export function crearConexion(){
  return mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
}
export async function ArtistasConsulta() {
  const con = crearConexion();

  return new Promise((resolve, reject) => {
    con.connect(function (err) {
      if (err) {
        console.error('Error connecting: ' + err.stack);
        reject(err);
        return;
      }

      console.log("Connected!");
      // Seleccionar datos de la tabla "artistas"

      con.query('call cons_artistas()', function (err, results) {
        if (err) {
          console.error('Error selecting data: ' + err.message);
          reject(err);
          return;
        }

        const artistasMap = new Map();
        
        results[0].forEach((row) => {
          const artistaNombre = row.NyA;

          // Verificar si el artista ya está en el map
          if (!artistasMap.has(artistaNombre)) {
            // Si no existe, crear una nueva instancia de artistas
            const nuevoArtista= new Artistas(row.dni, row.NyA, row.res_biografia, row.contacto,row.URL_foto);
            artistasMap.set(artistaNombre, nuevoArtista);
          }
        });

        // Convertir el Map a un array de artistas
        const listArtistas = Array.from(artistasMap.values());
        // Cerrar la conexión
        con.end();
        
        resolve(listArtistas);
      });
    });
  });
}

export async function EsculturasConsulta() {
  return new Promise((resolve, reject) => { // Aquí creamos una nueva promesa
    let con = crearConexion();

    con.connect(function (err) {
      if (err) {
        console.error('Error connecting: ' + err.stack);
        reject(err); // Rechazamos la promesa en caso de error
        return;
      }
      console.log("Connected!");

      con.query('CALL cons_esculturas()', function (err, results) {
        if (err) {
          console.error('Error selecting data: ' + err.message);
          reject(err); // Rechazamos la promesa en caso de error
          return;
        }

        const esculturasMap = new Map();

        results[0].forEach((row) => {
          const esculturaNombre = row.nombre;

          // Verificar si la escultura ya está en el map
          if (!esculturasMap.has(esculturaNombre)) {
            // Si no existe, crear una nueva instancia de Esculturas
            const nuevaEscultura = new Esculturas(row.nombre, row.f_creacion, row.antecedentes, row.tecnica);
            nuevaEscultura.setPromedio(row.promedio);  // Setear el promedio
            esculturasMap.set(esculturaNombre, nuevaEscultura);
          }

          // Obtener la escultura actual del map
          const escultura = esculturasMap.get(esculturaNombre);

          // Verificar y agregar artista
          if (!escultura.getArtistas().some(artista => artista.DNI === row.DNI)) {
            const nuevoArtista = new Artistas(
              row.DNI,
              row.NyA,
              row.res_biografia,
              row.contacto,
              row.URL_foto
            );
            escultura.addArtista(nuevoArtista);
          }

          // Verificar y agregar imagen
          if (!escultura.getImagenes().some(imagen => imagen.URL === row.URL)) {
            const nuevaImagen = new Imagenes(
              row.URL,
              row.etapa
          );
            escultura.addImagen(nuevaImagen);
          }

        });

        // Convertir el Map a un array de esculturas
        const listEsculturas = Array.from(esculturasMap.values());

        con.end(); // Cierra la conexión
        resolve(listEsculturas); // Resolvemos la promesa con el resultado
      });
    });
  });
};

export async function login(correo, password) {
  let con = crearConexion();

  return new Promise((resolve, reject) => {
    con.connect((err) => {
      if (err) {
        console.error('Error connecting: ' + err.stack);
        reject(err); // Rechazar la promesa en caso de error de conexión
        return;
      }
      console.log("Connected!");

      let selectQuery = `call cons_visitantes('${correo}','${password}')`;

      // Realizamos la consulta a la base de datos
      con.query(selectQuery, function (err, results){
        if (err) {
          console.error('Error querying the database:', err);
          reject(err); // Rechazar la promesa en caso de error en la consulta
        } else {
          resolve(results); // Resolver la promesa con los resultados
        }
        con.end(); // Cerramos la conexión
      });
    });
  });
}

export async function EventosConsulta(filtro, orden, busqueda, cantidad) {
  const con = crearConexion();

  return new Promise((resolve, reject) => {
    con.connect(function (err) {
      if (err) {
        console.error('Error connecting: ' + err.stack);
        reject(err);
        return;
      }

      console.log("Connected!");
      
      // Seleccionar datos de la tabla "eventos"
      con.query('call cons_eventos()', function (err, results) {
        if (err) {
          console.error('Error selecting data: ' + err.message);
          reject(err);
          return;
        }

        const listEventos = results.map((row) => {
          return new Eventos(row.nombre, row.lugar, row.fecha_inicio, row.fecha_fin, row.tematica, row.hora_inicio, row.hora_fin);
        });

        // Cerrar la conexión
        con.end();
        resolve(listEventos);
      });
    });
  });
}