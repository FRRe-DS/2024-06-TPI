import { Esculturas, Eventos, Artistas, Imagenes } from './clases.js';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
// Esto de abajo es para usar el .env para guardar la contraseña de la database
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });
// Crear un pool de conexiones reutilizable
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4_0900_ai_ci',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export function crearConexion(){
  return mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4_0900_ai_ci'
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

      con.query('CALL cons_artistas()', function (err, results) {
        if (err) {
          console.error('Error selecting data: ' + err.message);
          reject(err);
          return;
        }
        const resultados = results[0];
        const listArtistas = resultados.map((row) => {
          return new Artistas(row.DNI, row.NyA, row.res_biografia, row.contacto, row.URL_foto, row.promedio,row.nacionalidad);
        });

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
            const nuevaEscultura = new Esculturas(row.nombre, row.f_creacion, row.antecedentes, row.tecnica, row.promedio);
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
              row.URL_foto,
              0
            );
            escultura.addArtista(nuevoArtista);
          }

          // Verificar y agregar imagen
          if (!escultura.getImagenes().some(imagen => imagen.url === row.URL)) {
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

      // Consulta para obtener el hash de la contraseña
      const query = 'CALL getUserByEmail(?)'; // Procedimiento que obtiene datos del usuario por correo
      con.query(query, [correo], (err, results) => {
        if (err) {
          console.error('Error querying the database:', err);
          reject(err); // Rechazar la promesa en caso de error en la consulta
        } else if (results.length === 0) {
          // Si no se encuentra el usuario
          reject(new Error('Usuario no encontrado'));
        } else {
          // Comparamos la contraseña ingresada con la hasheada
          const hashedPassword = results[0][0].contraseña;
          bcrypt.compare(password, hashedPassword, (err, isMatch) => {
            if (err) {
              console.error('Error comparing passwords:', err);
              reject(err); // Rechazar en caso de error en la comparación
            } else if (!isMatch) {
              // Contraseña incorrecta
              reject(new Error('Contraseña incorrecta'));
            } else {
              // Contraseña correcta
              resolve(results[0]); // Resolver con los datos del usuario
            }
          });
        }
        con.end(); // Cerramos la conexión después de terminar
      });
    });
  });
}


export async function EventosConsulta() {
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
      con.query('CALL cons_eventos()', function (err, results) {
        if (err) {
          console.error('Error selecting data: ' + err.message);
          reject(err);
          return;
        }
        const resultados = results[0];
        const listEventos = resultados.map((row) => {
          return new Eventos(row.nombre, row.lugar, row.fecha_inicio, row.fecha_fin, row.tematica, row.hora_inicio, row.hora_fin, row.promedio);
        });

        // Cerrar la conexión
        con.end();
        resolve(listEventos);
      });
    });
  });
}


export async function ObrasdeUnEvento(evento) {
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
      con.query('CALL obrasDeUnEvento(?)', [evento], function (err, results) {
        if (err) {
          console.error('Error selecting data: ' + err.message);
          reject(err);
          return;
        }
        const esculturasMap = new Map();

        results[0].forEach((row) => {
          const esculturaNombre = row.nombre;

          // Verificar si la escultura ya está en el map
          if (!esculturasMap.has(esculturaNombre)) {
            // Si no existe, crear una nueva instancia de Esculturas
            const nuevaEscultura = new Esculturas(row.nombre, row.f_creacion, row.antecedentes, row.tecnica, row.promedio);
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
              row.URL_foto,
              0
            );
            escultura.addArtista(nuevoArtista);
          }

          // Verificar y agregar imagen
          if (!escultura.getImagenes().some(imagen => imagen.url === row.URL)) {
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
}

export async function ObrasdeUnArtista(artista) {
  const con = crearConexion();
  return new Promise((resolve, reject) => {
    con.connect(function (err) {
      if (err) {
        console.error('Error connecting: ' + err.stack);
        reject(err);
        return;
      }
      console.log("Connected!");

      con.query('CALL obrasDeUnArtista(?)', [artista], function (err, results) {
        if (err) {
          console.error('Error selecting data: ' + err.message);
          reject(err);
          return;
        }
        const esculturasMap = new Map();

        results[0].forEach((row) => {
          const esculturaNombre = row.nombre;

          // Verificar si la escultura ya está en el map
          if (!esculturasMap.has(esculturaNombre)) {
            // Si no existe, crear una nueva instancia de Esculturas
            const nuevaEscultura = new Esculturas(row.nombre, row.f_creacion, row.antecedentes, row.tecnica, row.promedio);
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
              row.URL_foto,
              0
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
}

export async function EventosYEsculturasDeObra(obra) {
  const con = crearConexion();
  return new Promise((resolve, reject) => {
    con.connect(function (err) {
      if (err) {
        console.error('Error connecting: ' + err.stack);
        reject(err);
        return;
      }
      console.log("Connected!");

      con.query('CALL EventosYEsculturasDeObra(?)', [obra], function (err, results) {
        if (err) {
          console.error('Error selecting data: ' + err.message);
          reject(err);
          return;
        }
        const artistasMap = new Map(); // Para asegurar artistas únicos
        const eventosMap = new Map(); // Para asegurar eventos únicos
        results[0].forEach((row) => {
            // Procesar artistas
            if (!artistasMap.has(row.DNI)) { // Verifica si el artista ya está en el mapa
              const nuevoArtista = new Artistas(
                row.DNI,
                row.NyA,
                row.res_biografia,
                row.contacto,
                row.URL_foto,
                0
              );
              artistasMap.set(row.DNI, nuevoArtista); // Agrega al mapa
            }

            // Procesar eventos
            if (!eventosMap.has(row.nombre)) { // Verifica si el evento ya está en el mapa
              const nuevoEvento = new Eventos(
                row.nombre,
                row.lugar,
                row.fecha_inicio,
                row.fecha_fin,
                row.tematica,
                row.hora_inicio,
                row.hora_fin,
                0
              );
              eventosMap.set(row.nombre, nuevoEvento); // Agrega al mapa
            }
          });
        // Convertir los mapas a listas
        const listas = {
          listaArtistas: Array.from(artistasMap.values()), // Artistas únicos
          listaEventos: Array.from(eventosMap.values()),  // Eventos únicos
        };
        con.end(); // Cierra la conexión
        resolve(listas); // Resolvemos la promesa con el resultado
        });
      });
    });
};



//InsertarEventos
export function insertarEvento(evento) {
  console.log("Insertando evento...");

  const query = `
    INSERT INTO eventos 
    SET nombre = '${evento.nombre}', 
        lugar = '${evento.lugar}', 
        tematica = '${evento.tematica}', 
        fecha_inicio = '${evento.fecha_inicio}', 
        fecha_fin = '${evento.fecha_fin}', 
        hora_inicio = '${evento.hora_inicio}', 
        hora_fin = '${evento.hora_fin}';
  `;

  // Retornar una promesa manualmente, envolviendo la llamada a pool.execute
  return new Promise((resolve, reject) => {
    pool.execute(query, (error, result) => {
      if (error) {
        reject(error); // Rechazamos la promesa en caso de error
      } else {
        console.log('Evento insertado:', result);
        // Ahora, accedemos directamente a insertId desde el objeto result
        resolve(result.insertId);
      }
    });
  }).catch(error => {
    console.error('Error al insertar evento:', error);
    throw error; // Propaga el error para manejo externo
  });
}

/*
const EventoNuevo = {
  nombre: "AAAnuevotest2",
  lugar: "Lugar del evento",
  tematica: "Temática del evento",
  fecha_inicio: "2024-12-05",
  fecha_fin: "2024-12-06",
  hora_inicio: "10:00:00",
  hora_fin: "18:00:00"
};*/


// Llamar a la función
//insertarEvento(EventoNuevo).catch(console.error);
//console.log("Listo?")




//Convertir Foto y Subir artista
//import cloudinary from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream'; // Para convertir el buffer en un flujo legible
import { promisify } from 'util'; // Para utilizar promesas con la función de Cloudinary
const uploadStreamPromise = promisify(cloudinary.uploader.upload_stream);

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});
// Función para insertar un artista



// Función para insertar un artista
export async function insertarArtista(artista, imagenPerfil) {
  console.log("Insertando artista...");
  console.log(imagenPerfil); // Para verificar que el archivo se recibe correctamente
  console.log("Datos del artista:", artista); // Para revisar el contenido del objeto artista

  // Validación básica de entrada
  if (!artista || !artista.DNI || !imagenPerfil || !imagenPerfil.buffer) {
    throw new Error("Faltan datos obligatorios: DNI o imagen.");
  }

  try {
    // Asegurarnos de que imagenPerfil.buffer es un Buffer
    let buffer = imagenPerfil.buffer;
    if (!(buffer instanceof Buffer)) {
      buffer = Buffer.from(buffer); // Si es un ArrayBuffer o tipo no esperado, convertirlo a Buffer
    }

    // Convertir el buffer de la imagen en un stream legible
    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null); // Indica el final del stream

    // Subir la imagen de perfil a Cloudinary usando upload_stream
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'profile-picture',
          public_id: `artista_${artista.DNI}`, // Usamos el DNI como ID único
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );
      bufferStream.pipe(stream); // Pasar el stream al uploader de Cloudinary
    });

    const urlFoto = result.secure_url;
    console.log("URL DE LA FOTO:", urlFoto);

    // Crear el query de inserción en la base de datos
    const query = `
      INSERT INTO artistas 
      (DNI, NyA, res_biografia, contacto, URL_foto, contrasena)
      VALUES ('${artista.DNI}', '${artista.NyA}', '${artista.res_biografia}', '${artista.contacto}', '${urlFoto}', '${artista.contrasena}');
    `;

    // Ejecutar el query para insertar el artista
    return new Promise((resolve, reject) => {
      pool.execute(query, (error, result) => {
        if (error) {
          console.error("Error al insertar el artista:", error);
          reject(error);
        } else {
          console.log("Artista insertado:", result);
          resolve(result.insertId);
        }
      });
    });
  } catch (error) {
    console.error("Error al subir la imagen o insertar el artista:", error);
    throw error;
  }
}


export async function register(nombreapellido, correo, contraseña) {
  let con = crearConexion();

  return new Promise((resolve, reject) => {
    bcrypt.hash(contraseña, 10, (err, hashedPassword) => { // 10 es el número de rondas de salt
      if (err) {
        console.error('Error hashing password:', err);
        reject(err); // Rechazar si hay un error al hashear la contraseña
        return;
      }

      con.connect((err) => {
        if (err) {
          console.error('Error connecting: ' + err.stack);
          reject(err); // Rechazar la promesa en caso de error de conexión
          return;
        }
        console.log("Connected!");

        // Realizamos la consulta a la base de datos pasando los parámetros
        const query = 'CALL register(?, ?, ?)'; // Definimos los placeholders
        con.query(query, [nombreapellido, correo, hashedPassword], (err, results) => { // Usamos la contraseña hasheada
          if (err) {
            console.error('Error querying the database:', err);
            reject(err); // Rechazar la promesa en caso de error en la consulta
          } else {
            resolve('hecho'); // Resolver la promesa con los resultados
          }
          con.end(); // Cerramos la conexión
        });
      });
    });
  });
}

export async function registrar_voto(rating, nombre, email) {
  let con = crearConexion();

  return new Promise((resolve, reject) => {
    con.connect((err) => {
      if (err) {
        console.error('Error connecting: ' + err.stack);
        reject(err); // Rechazar la promesa en caso de error de conexión
        return;
      }
      console.log("Connected!");

      // Realizamos la consulta a la base de datos pasando los parámetros
      const query = 'CALL registrar_voto(?, ?, ?)'; // Definimos los placeholders
      con.query(query, [email, nombre, rating], (err, results) => { // Pasamos los valores
        if (err) {
          console.error('Error querying the database:', err);
          reject(err); // Rechazar la promesa en caso de error en la consulta
        } else {
          resolve('hecho'); // Resolver la promesa con los resultados
        }
        con.end(); // Cerramos la conexión
      });
    });
  });
}

export async function cambiar_Contraseña(correo, contraseña_actual, contraseña_nueva) {

  const con = crearConexion();

  return new Promise((resolve, reject) => {
    con.connect((err) => {
      if (err) {
        console.error('Error connecting: ' + err.stack);
        reject(err);
        return;
      }
      console.log("Connected!");
      

      // Consulta para obtener el hash de la contraseña
      con.query('CALL getUserByEmail(?)', [correo], (err, results) => {
        if (err) {
          console.error('Error querying the database:', err);
          reject(err); // Rechazar la promesa en caso de error en la consulta
        } else if (results.length === 0) {
          // Si no se encuentra el usuario
          reject(new Error('Usuario no encontrado'));
        } else {
          // Comparamos la contraseña ingresada con la hasheada
          const hashedPassword = results[0][0].contraseña;
          bcrypt.compare(contraseña_actual, hashedPassword, (err, isMatch) => {
            if (err) {
              console.error('Error comparing passwords:', err);
              reject(err); // Rechazar en caso de error en la comparación
            } else if (!isMatch) {
              // Contraseña incorrecta
              reject(new Error('Contraseña incorrecta'));
            } else {
              // Contraseña correcta
              bcrypt.hash(contraseña_nueva, 10, (err, hashedPassword) => { // 10 es el número de rondas de salt
                if (err) {
                  console.error('Error hashing password:', err);
                  reject(err); // Rechazar si hay un error al hashear la contraseña
                  return;
                }
                con.query('CALL cambiar_contraseña(?,?)', [correo, hashedPassword], async (err, results) => { // Pasamos los valores
                if (err) {
                  console.error('Error querying the database:', err);
                  reject(err); // Rechazar la promesa en caso de error en la consulta
                } else {
                  
                  resolve('hecho'); // Resolver la promesa con los resultados
                }
                con.end(); // Cerramos la conexión
              });
            })};
          });
        }
      });
    });
  });
}
//Registrar escultura
export async function registrar_escultura(nombre, f_creacion, antecedentes, tecnica) {
  let con = crearConexion();

  return new Promise((resolve, reject) => {
    con.connect((err) => {
      if (err) {
        console.error('Error connecting: ' + err.stack);
        reject(err); // Rechazar la promesa en caso de error de conexión
        return;
      }
      console.log("Connected!");

      // Realizamos la consulta a la base de datos pasando los parámetros
      const query = 'INSERT INTO esculturas (nombre, f_creacion, antecedentes, tecnica) VALUES (?, ?, ?, ?)'; // Usamos placeholders
      con.query(query, [nombre, f_creacion, antecedentes, tecnica], (err, results) => { // Pasamos los valores
        if (err) {
          console.error('Error querying the database:', err);
          reject(err); // Rechazar la promesa en caso de error en la consulta
        } else {
          resolve('Registro exitoso'); // Resolver la promesa con los resultados
        }
        con.end(); // Cerramos la conexión
      });
    });
  });
}


//Registar hechas por
export async function registrar_hechas_por(DNI, nombre_escultura) {
  let con = crearConexion(); // Asegúrate de que esta función esté bien configurada

  return new Promise((resolve, reject) => {
    con.connect((err) => {
      if (err) {
        console.error('Error connecting: ' + err.stack);
        reject(err);
        return;
      }
      console.log("Connected!");

      // Consulta SQL para insertar en la tabla `hechas_por`
      const query = 'INSERT INTO hechas_por (DNI, nombre_escultura) VALUES (?, ?)';
      con.query(query, [DNI, nombre_escultura], (err, results) => {
        if (err) {
          console.error('Error querying the database:', err);
          reject(err);
        } else {
          resolve('Registro exitoso en hechas_por');
        }
        con.end(); // Cerramos la conexión
      });
    });
  });
};

//Proabaaaaaaaaaararararrararaararararararararararararararararararararararraraarraraarrararara
export async function registrar_imagen(etapa, nombre_escultura, imagen) {
  console.log("Insertando imagen...");
  console.log("Etapa:", etapa);
  console.log("Nombre de la escultura:", nombre_escultura);
  console.log("Detalles de la imagen:", imagen);

  // Validación básica de los datos
  if (!etapa || !nombre_escultura || !imagen || !imagen.buffer) {
    throw new Error("Faltan datos obligatorios: etapa, nombre de escultura o imagen.");
  }

  try {
    // Asegurarnos de que imagen.buffer sea un Buffer
    let buffer = imagen.buffer;
    if (!(buffer instanceof Buffer)) {
      buffer = Buffer.from(buffer); // Convertir si no es un Buffer
    }

    // Convertir el buffer de la imagen en un stream legible
    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null); // Indicar el final del stream

    // Subir la imagen a Cloudinary usando upload_stream
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'imagenes_obras', // Carpeta donde se guardará la imagen
          public_id: `imagen_${nombre_escultura}_${etapa}`, // ID único basado en la escultura y etapa
          resource_type: 'image', // Especificar que es una imagen
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );
      bufferStream.pipe(stream); // Pasa el stream al uploader de Cloudinary
    });

    const urlFoto = result.secure_url; // URL de la imagen subida
    console.log("URL DE LA IMAGEN:", urlFoto);

    // Crear el query para insertar en la base de datos
    const query = `
      INSERT INTO imagenes (etapa, nombre_escultura, URL) 
      VALUES (?, ?, ?);
    `;

    // Ejecutar el query para insertar la imagen
    return new Promise((resolve, reject) => {
      pool.execute(query, [etapa, nombre_escultura, urlFoto], (error, result) => {
        if (error) {
          console.error("Error al insertar la imagen:", error);
          reject(error);
        } else {
          console.log("Imagen insertada:", result);
          resolve(result.insertId); // Devuelve el ID insertado
        }
      });
    });
  } catch (error) {
    console.error("Error al subir la imagen o insertar en la base de datos:", error);
    throw error; // Lanza el error para que sea capturado en la función principal
  }
}



//registrar compiten
export async function registrar_compiten(nombre_evento, nombre_escultura) {
  console.log("Insertando registro en compiten...");
  console.log("Evento:", nombre_evento);
  console.log("Escultura:", nombre_escultura);

  // Validación básica de entrada
  if (!nombre_evento || !nombre_escultura) {
    throw new Error("Faltan datos obligatorios: nombre_evento o nombre_escultura.");
  }

  try {
    // Crear el query para insertar en la tabla `compiten`
    const query = `
      INSERT INTO compiten (nombre_evento, nombre_escultura) 
      VALUES (?, ?);
    `;

    // Ejecutar el query
    return new Promise((resolve, reject) => {
      pool.execute(query, [nombre_evento, nombre_escultura], (error, result) => {
        if (error) {
          console.error("Error al insertar en compiten:", error);
          reject(error);
        } else {
          console.log("Registro insertado en compiten:", result);
          resolve(result.insertId);
        }
      });
    });
  } catch (error) {
    console.error("Error al registrar en compiten:", error);
    throw error;
  }
}

export async function borrar_evento(nombre_evento, lugar_evento) {
  let con = crearConexion(); // Asegúrate de que esta función esté bien configurada

  return new Promise((resolve, reject) => {
    con.connect((err) => {
      if (err) {
        console.error('Error connecting: ' + err.stack);
        reject(err);
        return;
      }
      console.log("Connected!");

      // Llamada al procedimiento almacenado `borrar_evento`
      const query = 'CALL borrar_evento(?, ?)';
      con.query(query, [nombre_evento, lugar_evento], (err, results) => {
        if (err) {
          console.error('Error executing the procedure:', err);
          reject(err);
        } else {
          resolve('Evento borrado exitosamente');
        }
        con.end(); // Cerramos la conexión
      });
    });
  });
};


export async function modificar_evento(
  nombre_evento_actual,
  lugar_evento_actual,
  nombre_evento_nuevo,
  lugar_evento_nuevo,
  fecha_inicio,
  fecha_fin,
  tematica,
  hora_inicio,
  hora_fin
) {
  let con = crearConexion(); // Asegúrate de que esta función esté bien configurada

  return new Promise((resolve, reject) => {
    con.connect((err) => {
      if (err) {
        console.error('Error connecting: ' + err.stack);
        reject(err);
        return;
      }
      console.log("Connected!");

      // Llamada al procedimiento almacenado `modificar_evento`
      const query = 'CALL modificar_evento(?, ?, ?, ?, ?, ?, ?, ?, ?)';
      con.query(query, [
        nombre_evento_actual,
        lugar_evento_actual,
        nombre_evento_nuevo,
        lugar_evento_nuevo,
        fecha_inicio,
        fecha_fin,
        tematica,
        hora_inicio,
        hora_fin
      ], (err, results) => {
        if (err) {
          console.error('Error executing the procedure:', err);
          reject(err);
        } else {
          resolve('Evento modificado exitosamente');
        }
        con.end(); // Cerramos la conexión
      });
    });
  });
};

export async function modificar_artista(
  dni_resguardado,
  nombre,
  apellido,
  dni,
  biografia,
  email,
  contraseña,
  imagenPerfil
) {
  console.log(dni_resguardado, nombre,apellido,dni,biografia,email, contraseña,imagenPerfil);
  let con = crearConexion(); // Asegúrate de que esta función esté bien configurada
  return new Promise((resolve, reject) => {
    con.connect((err) => {
      if (err) {
        console.error('Error connecting: ' + err.stack);
        reject(err);
        return;
      }
      console.log("Connected!");

      // Llamada al procedimiento almacenado `modificar_artista`
      const query = 'CALL modificar_artista(?, ?, ?, ?, ?, ?, ?)';
      console.log(dni_resguardado,
        dni,
        nombre + ' ' + apellido,
        biografia,
        email,
        imagenPerfil,
        contraseña)
      con.query(query, [
        dni_resguardado,
        dni,
        nombre + ' ' + apellido,
        biografia,
        email,
        imagenPerfil,
        contraseña
      ], (err, results) => {
        if (err) {
          reject(err);
        } else {
          console.log(results)
          resolve('Evento modificado exitosamente');
        }
        con.end(); // Cerramos la conexión
      });
    });
  });
};

export async function borrar_artista(DNI) {
  let con = crearConexion(); // Asegúrate de que esta función esté bien configurada
  console.log("Se llama al 2do")

  return new Promise((resolve, reject) => {
    con.connect((err) => {
      if (err) {
        console.error('Error connecting: ' + err.stack);
        reject(err);
        return;
      }
      console.log("Connected!");

      // Llamada al procedimiento almacenado `borrar_artista`
      const query = 'CALL borrar_artista(?)';
      con.query(query, [DNI], (err, results) => {
        if (err) {
          console.error('Error executing the procedure:', err);
          reject(err);
        } else {
          resolve('Artista borrado exitosamente');
        }
        con.end(); // Cerramos la conexión
      });
    });
  });
};

export async function borrar_escultura(nombreEscultura) {
  let con = crearConexion(); // Asegúrate de que esta función esté bien configurada
  console.log("Se llama al 2do para borrar escultura");

  return new Promise((resolve, reject) => {
    con.connect((err) => {
      if (err) {
        console.error('Error connecting: ' + err.stack);
        reject(err);
        return;
      }
      console.log("Connected!");

      // Llamada al procedimiento almacenado `borrar_obra`
      const query = 'CALL borrar_obra(?)';
      con.query(query, [nombreEscultura], (err, results) => {
        if (err) {
          console.error('Error executing the procedure:', err);
          reject(err);
        } else {
          resolve('Escultura borrada exitosamente');
        }
        con.end(); // Cerramos la conexión
      });
    });
  });
};


