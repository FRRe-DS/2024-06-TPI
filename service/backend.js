import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import NodeCache from 'node-cache';
import multer from 'multer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

import { ArtistasConsulta, EsculturasConsulta, EventosConsulta, login, 
  ObrasdeUnEvento, ObrasdeUnArtista, EventosYEsculturasDeObra, insertarEvento, 
  insertarArtista, register, registrar_voto,registrar_escultura, registrar_hechas_por, 
  registrar_imagen, registrar_compiten, cambiar_Contraseña,modificar_evento,borrar_evento,borrar_artista,
  modificar_artista } from './conexiondb.js';

import { ordenarEsculturas, buscarEsculturas, ordenarEventos, 
  buscarEventos, ordenarArtistas, buscarArtistas, eventoProximo } from './filtrosObjetos.js';
import bcrypt from 'bcrypt';
import sharp from 'sharp';
// Clave secreta para firmar el token (debería ser almacenada de forma segura, como en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET; // Cambir por algo más seguro
const app = express();
const port = 3001;

const cache = new NodeCache();
const ttl = 1800; // 30 minutos en segundos

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Multer para manejar la carga de archivos
const storage = multer.memoryStorage(); // Guardar archivo en memoria (como buffer)
const upload = multer({ storage: storage });

// Lista de correos electrónicos de administradores
const adminEmails = ['admin1@example.com', 'admin2@example.com'];

app.use(cors()); // Permitir CORS
// Middleware para analizar el cuerpo de la solicitud (JSON)
app.use(bodyParser.json());

// Crear una función asincrónica para manejar las consultas a la base de datos
const obtenerArtistas = async (busqueda, criterio, orden) => {
  try {
    let artistasCache = cache.get('artistas');
    if (!artistasCache) {
      artistasCache = await ArtistasConsulta();
      cache.set('artistas', artistasCache, ttl);
    }

    const artistasFiltrados = buscarArtistas(artistasCache, busqueda);
    const ArtistasOrdenados = ordenarArtistas(artistasFiltrados, criterio, orden);

    const cards = [];
    for (const [index, artista] of ArtistasOrdenados.entries()) {
      // Accede a los métodos de la clase Esculturas
      const dni = artista.getDNI();
      const nombre = artista.getNyA();
      const imagen = artista.getURL_foto();
      const biografia = artista.getRes_biografia();
      const contacto = artista.getContacto();
      const promedio = artista.getPromedio();
      const DNI = artista.getDNI();
      const nacionalidad=artista.getNacionalidad();
      cards.push({
        id: index + 1,
        dni: dni,
        escultorPantalla: nombre.replace(/ /g, ''), 
        content: biografia,
        escultorName: nombre,
        escultorFoto: imagen,
        contactoEmail: contacto,
        promedio: promedio,
        DNI: DNI,
        nacionalidad:nacionalidad
      });
    }
    return cards;

  } catch (error) {
    console.error('Error al obtener artistas:', error);
    return [];
  }
};

const obtenerEsculturas = async (busqueda, criterio, orden) => {
  try {
    let esculturasCache = cache.get('esculturas');
    if (!esculturasCache) {
      esculturasCache = await EsculturasConsulta();
      cache.set('esculturas', esculturasCache, ttl);
    }

    const esculturasFiltradas = buscarEsculturas(esculturasCache, busqueda);
    const esculturasOrdenadas = ordenarEsculturas(esculturasFiltradas, criterio, orden);
    const cards = [];
    for (const [index, escultura] of esculturasOrdenadas.entries()) {
      // Accede a los métodos de la clase Esculturas
      const listaObraImagenes = escultura.getImagenes();
      const obraImagen = listaObraImagenes.map((imagen) => imagen.getURL());
      const tecnica = escultura.getTecnica();
      const obraNombre = escultura.getNombre();
      const obraArtistas = escultura.getArtistas();
      const obraArtista = obraArtistas.map((artista) => artista.getNyA());
      const obraEscultorFoto = obraArtistas.map((artista) => artista.getURL_foto());
      const obraEscultor = {
        escultoresFotos: obraEscultorFoto,
        escultoresNombre: obraArtista
      }
      const average = escultura.getPromedio();
      const fecha_creacion = escultura.getFechaCreacion();
      const promedioEstrellas = escultura.getPromedio();
      const antecedente = escultura.getAntecedente();

      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const formattedFecha_creacion = fecha_creacion.toLocaleDateString('es-ES', options);

      cards.push({
        id: index + 1,
        title: 'Carta' + (index + 1),
        obraPantalla: obraNombre.replace(/ /g, ''),
        obraImage: obraImagen,
        content: tecnica,
        obraName: obraNombre,
        obraEscultor: obraEscultor,
        promedio: average,
        f_creacion: formattedFecha_creacion,
        promedio: promedioEstrellas,
        antecedente: antecedente
      });
    }

    return cards;

  } catch (error) {
    console.error('Error al obtener esculturas:', error);
    return [];  // Retornar un array vacío en caso de error
  }
};

const obtenerEventos = async (busqueda, criterio, orden) => {
  try {
    let eventosCache = cache.get('eventos');
    if (!eventosCache) {
      eventosCache = await EventosConsulta();
      cache.set('eventos', eventosCache, ttl);
    }

    const eventosFiltrados = buscarEventos(eventosCache, busqueda);
    const eventosOrdenados = ordenarEventos(eventosFiltrados, criterio, orden);

    const now = new Date();  // Obtener la fecha y hora actual una sola vez

    const cards = [];
    for (const [index, evento] of eventosOrdenados.entries()) {
      // Accede a los métodos de la clase Eventos
      const titulo = evento.getNombre();
      const fechaInicio = new Date(evento.getFechaInicio());
      const fechaFin = new Date(evento.getFechaFin());
      const tematica = evento.getTematica();
      const lugar = evento.getLugar();
      const horaInicio = evento.getHoraInicio();
      const horaFin = evento.getHoraFin();
      const promedio = evento.getPromedio();
      const options = {month: 'long', day: 'numeric' };
      const formattedFechaInicio = fechaInicio.toLocaleDateString('es-ES', options);
      const formattedFechaFin = fechaFin.toLocaleDateString('es-ES', options);

      const formattedHoraInicio = horaInicio.split(':').slice(0, 2).join(':');  // De "09:30:00" a "09:30"
      const formattedHoraFin = horaFin.split(':').slice(0, 2).join(':');        // De "15:00:00" a "15:00"

      // Crear objetos Date completos para el inicio y fin con hora y fecha
      const eventoInicio = new Date(fechaInicio.setHours(horaInicio.split(':')[0], horaInicio.split(':')[1]));
      const eventoFin = new Date(fechaFin.setHours(horaFin.split(':')[0], horaFin.split(':')[1]));
      // Calcular el estado basado en la fecha y hora
      let estado = 'Terminado';
      if (now < eventoInicio) {
        estado = 'Próximo';
      } else if (now >= eventoInicio && now <= eventoFin) {
        estado = 'En curso';
      }

      cards.push({
        title: 'evento' + (index + 1),
        eventName: titulo,
        eventoPantalla: titulo.replace(/ /g, ''),
        eventStartDate: formattedFechaInicio,
        eventFinishDate: formattedFechaFin,
        startTime: formattedHoraInicio,
        finishTime: formattedHoraFin,
        location: lugar,
        content: tematica,
        promedio: promedio,
        estado: estado 
      });
    }

    return cards;

  } catch (error) {
    console.error('Error al obtener eventos:', error);
    return [];  // Retornar un array vacío en caso de error
  }
};

const obtenerObrasdeEvento = async (evento) => {
  try {
    const esculturasEvento = await ObrasdeUnEvento(evento);
    const esculturasOrdenadas = ordenarEsculturas(esculturasEvento, 'promedio', 'DESC');

    const cards = [];
    for (const [index, escultura] of esculturasOrdenadas.entries()) {
      // Accede a los métodos de la clase Esculturas
      const listaObraImagenes = escultura.getImagenes();
      const obraImagen = listaObraImagenes.map((imagen) => imagen.getURL());
      const tecnica = escultura.getTecnica();
      const obraNombre = escultura.getNombre();
      const obraArtistas = escultura.getArtistas();
      const obraArtista = obraArtistas.map((artista) => artista.getNyA());
      const obraEscultorFoto = obraArtistas.map((artista) => artista.getURL_foto());
      const obraEscultor = {
        escultoresFotos: obraEscultorFoto,
        escultoresNombre: obraArtista
      }
      const average = escultura.getPromedio();
      const fecha_creacion = escultura.getFechaCreacion();
      const promedioEstrellas = escultura.getPromedio();
      const antecedente = escultura.getAntecedente();

      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const formattedFecha_creacion = fecha_creacion.toLocaleDateString('es-ES', options);

      cards.push({
        id: index + 1,
        title: 'Carta' + (index + 1),
        obraPantalla: obraNombre.replace(/ /g, ''),
        obraImage: obraImagen,
        content: tecnica,
        obraName: obraNombre,
        obraEscultor: obraEscultor,
        promedio: average,
        f_creacion: formattedFecha_creacion,
        promedio: promedioEstrellas,
        antecedente: antecedente
      });
    }

    return cards;

  } catch (error) {
    console.error('Error al obtener esculturas:', error);
    return [];  // Retornar un array vacío en caso de error
  }
}

const obtenerObrasdeArtista = async (artista) => {
  try {
    const esculturasArtista = await ObrasdeUnArtista(artista);
    const esculturasOrdenadas = ordenarEsculturas(esculturasArtista, 'promedio', 'DESC');

    const cards = [];
    for (const [index, escultura] of esculturasOrdenadas.entries()) {
      // Accede a los métodos de la clase Esculturas
      const listaObraImagenes = escultura.getImagenes();
      const obraImagen = listaObraImagenes.map((imagen) => imagen.getURL());
      const tecnica = escultura.getTecnica();
      const obraNombre = escultura.getNombre();
      const average = escultura.getPromedio();
      const fecha_creacion = escultura.getFechaCreacion();
      const promedioEstrellas = escultura.getPromedio();
      const antecedente = escultura.getAntecedente();

      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const formattedFecha_creacion = fecha_creacion.toLocaleDateString('es-ES', options);

      cards.push({
        id: index + 1,
        title: 'Carta' + (index + 1),
        obraPantalla: obraNombre.replace(/ /g, ''),
        obraImage: obraImagen,
        content: tecnica,
        obraName: obraNombre,
        promedio: average,
        f_creacion: formattedFecha_creacion,
        promedio: promedioEstrellas,
        antecedente: antecedente
      });
    }

    return cards;

  } catch (error) {
    console.error('Error al obtener esculturas:', error);
    return [];  // Retornar un array vacío en caso de error
  }
}

const obtenerArtistasyEventosdeObra = async (obra) => {
  try {
    const listas = await EventosYEsculturasDeObra(obra);

    const obraEventos = listas.listaEventos;
    const obraArtistas = listas.listaArtistas;

    const ArtistasOrdenados = ordenarArtistas(obraArtistas, 'promedio', 'DESC');
    const eventosOrdenados = ordenarEventos(obraEventos, 'promedio', 'DESC');

    const cardsArtistas = [];
    for (const [index, artista] of ArtistasOrdenados.entries()) {
      // Accede a los métodos de la clase Esculturas
      const nombre = artista.getNyA();
      const imagen = artista.getURL_foto();
      const biografia = artista.getRes_biografia();
      const contacto = artista.getContacto();
      const promedio = artista.getPromedio();

      cardsArtistas.push({
        id: index + 1,
        escultorPantalla: nombre.replace(/ /g, ''),
        content: biografia,
        escultorName: nombre,
        escultorFoto: imagen,
        contactoEmail: contacto,
        promedio: promedio
      });
    }

    const cardsEventos = [];
    for (const [index, evento] of eventosOrdenados.entries()) {
      // Accede a los métodos de la clase Eventos
      const titulo = evento.getNombre();
      const fechaInicio = new Date(evento.getFechaInicio());
      const fechaFin = new Date(evento.getFechaFin());
      const tematica = evento.getTematica();
      const lugar = evento.getLugar();
      const horaInicio = evento.getHoraInicio();
      const horaFin = evento.getHoraFin();
      const promedio = evento.getPromedio();
      const options = { month: 'long', day: 'numeric' };
      const formattedFechaInicio = fechaInicio.toLocaleDateString('es-ES', options);
      const formattedFechaFin = fechaFin.toLocaleDateString('es-ES', options);

      const formattedHoraInicio = horaInicio.split(':').slice(0, 2).join(':');  // De "09:30:00" a "09:30"
      const formattedHoraFin = horaFin.split(':').slice(0, 2).join(':');        // De "15:00:00" a "15:00"


      cardsEventos.push({
        title: 'evento' + (index + 1),
        eventName: titulo,
        eventoPantalla: titulo.replace(/ /g, ''),
        eventStartDate: formattedFechaInicio,
        eventFinishDate: formattedFechaFin,
        startTime: formattedHoraInicio,
        finishTime: formattedHoraFin,
        location: lugar,
        content: tematica,
        promedio: promedio
      });
    }

    const cards = {
      cardsArtistas: cardsArtistas, // Artistas únicos
      cardsEventos: cardsEventos  // Eventos únicos
    };

    return cards;

  } catch (error) {
    console.error('Error al obtener eventos:', error);
    return [];  // Retornar un array vacío en caso de error
  }
};

const obtenerEventoProximo = async () => {
  try {
    let eventosCache = cache.get('eventos');
    if (!eventosCache) {
      eventosCache = await EventosConsulta();
      cache.set('eventos', eventosCache, ttl);
    }
    const eventProximo = eventoProximo(eventosCache);

    const card = [];
    if (eventProximo) {
      const titulo = eventProximo.getNombre();
      const fechaInicio = new Date(eventProximo.getFechaInicio());
      const fechaFin = new Date(eventProximo.getFechaFin());
      const tematica = eventProximo.getTematica();
      const lugar = eventProximo.getLugar();
      const horaInicio = eventProximo.getHoraInicio();
      const horaFin = eventProximo.getHoraFin();
      const promedio = eventProximo.getPromedio();
      const options = { month: 'long', day: 'numeric' };
      const formattedFechaInicio = fechaInicio.toLocaleDateString('es-ES', options);
      const formattedFechaFin = fechaFin.toLocaleDateString('es-ES', options);

      const formattedHoraInicio = horaInicio.split(':').slice(0, 2).join(':');  // De "09:30:00" a "09:30"
      const formattedHoraFin = horaFin.split(':').slice(0, 2).join(':');        // De "15:00:00" a "15:00"

      card.push({
        title: 'evento',
        eventName: titulo,
        eventoPantalla: titulo.replace(/ /g, ''),
        eventStartDate: formattedFechaInicio,
        eventFinishDate: formattedFechaFin,
        startTime: formattedHoraInicio,
        finishTime: formattedHoraFin,
        location: lugar,
        content: tematica,
        promedio: promedio
      });

      return card;
    }
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    return [];  // Retornar un array vacío en caso de error
  }
};

// Middleware para verificar token y rol
const verificarTokenYRol = (rolesPermitidos) => (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(403).json({ success: false, message: 'Token no proporcionado' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ success: false, message: 'Token inválido' });

    if (!rolesPermitidos.includes(decoded.role)) {
      return res.status(403).json({ success: false, message: 'No tiene permisos para acceder a esta ruta' });
    }

    req.user = decoded; // Guarda la información del usuario decodificada en la solicitud
    next();
  });
};

app.get('/api/escultores/:nombre', async (req, res) => {
  const nombre = req.params.nombre; // Obtiene el nombre del parámetro de la URL
  const cards = await obtenerArtistas(nombre, 'nombre', 'DESC');; // Función para obtener un escultor específico
  const cardsObras = await obtenerObrasdeArtista(nombre)
  const respuesta = {
    escultor: cards[0],
    obras: cardsObras
  };
  res.json(respuesta);
});

// Endpoint para obtener escultores
app.get('/api/escultores', async (req, res) => {
  const searchQuery = req.query.search;
  const criterio = req.query.sortBy;
  const orden = req.query.order;
  const cards = await obtenerArtistas(searchQuery, criterio, orden);  // Esperamos a que se procesen todas las consultas
  res.json(cards);
});

// Endpoint para obtener esculturas
app.get('/api/esculturas', async (req, res) => {
  const searchQuery = req.query.search;
  const criterio = req.query.sortBy;
  const orden = req.query.order;
  const cards = await obtenerEsculturas(searchQuery, criterio, orden);  // Esperamos a que se procesen todas las consultas
  res.json(cards);
});

app.get('/api/obras/:nombre', async (req, res) => {
  const nombre = req.params.nombre; // Obtiene el nombre del parámetro de la URL
  const cardsEscultura = await obtenerEsculturas(nombre, 'nombre', 'DESC');
  const cardsArtistasYEventos = await obtenerArtistasyEventosdeObra(nombre);
  const cards = {
    cardsEscultura: cardsEscultura[0],
    cardsArtistas: cardsArtistasYEventos.cardsArtistas, // Artistas únicos
    cardsEventos: cardsArtistasYEventos.cardsEventos  // Eventos únicos
  };
  res.json(cards);
});

app.get('/api/eventos', async (req, res) => {
  const searchQuery = req.query.search;
  const criterio = req.query.sortBy;
  const orden = req.query.order;
  const cards = await obtenerEventos(searchQuery, criterio, orden);  // Esperamos a que se procesen todas las consultas
  res.json(cards);
});

app.get('/api/eventoProximo', async (req, res) => {
  const cards = await obtenerEventoProximo();
  res.json(cards);
});

app.get('/api/eventos/:nombre', async (req, res) => {
  const nombre = req.params.nombre;
  const cards = await obtenerEventos(nombre, 'nombre', 'DESC');
  
  if (!cards || cards.length === 0) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }

  const realEventName = cards[0].eventName;
  const cardsObras = await obtenerObrasdeEvento(realEventName);
  
  const respuesta = {
    evento: cards[0],
    obras: cardsObras
  };
  res.json(respuesta);
});

app.post('/api/login', (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json({ message: 'Por favor ingrese correo y contraseña' });
  }
  // Obtener la lista de los 
  const emailList = process.env.EMAIL_LIST.split(',').map(item => {
    const [nombre, email, password] = item.split(':');
    return {nombre, email, password };
  });
  const esAdmin = emailList.some(
    entry => entry.email === correo && entry.password === contraseña
  );
  if (esAdmin) {
    const user = emailList.find(
      entry => entry.email === correo && entry.password === contraseña
    );
    let role = 'admin';
    const token = jwt.sign({ correo: correo, permisos: role, nombre: user.nombre }, JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ success: true, message: 'Inicio de sesión exitoso', token, role });
  } else {
    login(correo, contraseña)
      .then(conexion => {
        if (conexion && conexion.length > 0) {
          // Determinar el rol del usuario
          let role;
          if (conexion[0].permisos === 'escultor') { // Si 'permisos' indica que es un artista
            role = 'escultor';
          } else {
            role = 'usuario';
          }
          // Crear el token con el correo y el rol determinado
          const token = jwt.sign({ correo: conexion[0].email, permisos: conexion[0].permisos, nombre: conexion[0].NyA }, JWT_SECRET, { expiresIn: '1h' });
          return res.status(200).json({ success: true, message: 'Inicio de sesión exitoso', token, role });
        } else {
          return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
        }
      })
      .catch(error => {
        console.error('Error en la conexión:', error);
        return res.status(500).json({ success: false, message: 'Error en el servidor' });
      });
  }
});

// Endpoint para verificar el token y obtener el correo
app.get('/api/verificar', verificarTokenYRol, (req, res) => {
    const correo = req.user.correo; // Suponiendo que el correo está en el payload del token
    res.json({ success: true, correo });
});

// Ruta solo para administradores
app.get('/api/admin', verificarTokenYRol(['admin']), (req, res) => {
  res.json({ message: 'Acceso permitido solo para administradores' });
});

// Ruta solo para escultores
app.get('/api/escultor', verificarTokenYRol(['escultor']), (req, res) => {
  res.json({ message: 'Acceso permitido solo para escultores' });
});

// Ruta accesible tanto para escultores como para administradores
app.get('/api/escultores-y-admins', verificarTokenYRol(['escultor', 'admin']), (req, res) => {
  res.json({ message: 'Acceso permitido para escultores y administradores' });
});

app.get('/api/artista/:email', async (req, res) => {
  const email = req.params.email;

  try {
    const artistaObra = await obtenerArtistaYObraReciente(email);

    if (!artistaObra) {
      return res.status(404).json({ success: false, message: 'Artista no encontrado o sin obras recientes' });
    }

    res.json({
      success: true,
      artista: {
        nombre: artistaObra.artistaNombre,
        dni: artistaObra.artistaDNI,
        biografia: artistaObra.biografia,
        contacto: email, // Puede que quieras incluir el contacto o eliminar este campo
      },
      obraReciente: {
        nombre: artistaObra.obraNombre,
        fechaCreacion: artistaObra.obraFechaCreacion,
        tecnica: artistaObra.tecnica,
        imagenURL: artistaObra.imagen_url
      }
    });
  } catch (error) {
    console.error("Error en el endpoint de artista:", error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

app.post('/api/registro', (req, res) => {
  const { nombreapellido, correo, contraseña } = req.body;

  if (!nombreapellido || !correo || !contraseña) {
    return res.status(400).json({ message: 'Por favor ingrese todos los campos' });
  }

  register(nombreapellido, correo, contraseña)
  .then(conexion => {
    if (conexion == 'hecho') {
      const token = jwt.sign({correo: correo, permisos: 'visitante', nombreapellido}, JWT_SECRET, {expiresIn: '1h'});
      return res.status(200).json({ success: true, message: 'Registro correcto', token});
    } else {
      return res.status(401).json({ success: false, message: 'Registro invalido'});
    }

  })
  .catch(error => {
    console.error('Error en la conexión:', error);
    if (error.code == 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'El correo ya está en uso. Por favor use uno diferente' });	
    }
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  });
});

app.post('/api/cambiarContrasena', (req, res) => {
  const { email, contraseña_actual, contraseña_nueva1  } = req.body;
  console.log(email, contraseña_actual, contraseña_nueva1);
  if (!email || !contraseña_actual || !contraseña_nueva1) {
    return res.status(400).json({ message: 'Por favor ingrese todos los campos'});
  }

  cambiar_Contraseña(email, contraseña_actual, contraseña_nueva1)
    .then(conexion => {
      if (conexion == 'hecho') {
        return res.status(200).json({ success: true, message: 'Contraseña cambiada correctamente'});
      } else {
        return res.status(401).json({ success: false, message: 'Error en el cambio de contraseña' });
      }

    })
    .catch(error => {
      console.error('Error en la conexión:', error);
      if (error.code == 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'El correo ya está en uso. Por favor use uno diferente' });
      }
      if (error.message === 'Contraseña incorrecta') {
        return res.status(500).json({ success: false, message: 'Contraseña incorrecta' });
      } else {
        return res.status(500).json({ success: false, message: 'Error en el servidor' });
      }
    });
});

app.post('/api/cambiarContrasena', (req, res) => {
  const { email, contraseña_actual, contraseña_nueva1  } = req.body;
  console.log(email, contraseña_actual, contraseña_nueva1);
  if (!email || !contraseña_actual || !contraseña_nueva1) {
    return res.status(400).json({ message: 'Por favor ingrese todos los campos'});
  }

  cambiar_Contraseña(email, contraseña_actual, contraseña_nueva1)
    .then(conexion => {
      if (conexion == 'hecho') {
        return res.status(200).json({ success: true, message: 'Contraseña cambiada correctamente'});
      } else {
        return res.status(401).json({ success: false, message: 'Error en el cambio de contraseña' });
      }

    })
    .catch(error => {
      console.error('Error en la conexión:', error);
      if (error.code == 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'El correo ya está en uso. Por favor use uno diferente' });
      }
      if (error.message === 'Contraseña incorrecta') {
        return res.status(500).json({ success: false, message: 'Contraseña incorrecta' });
      } else {
        return res.status(500).json({ success: false, message: 'Error en el servidor' });
      }
    });
});

app.post('/api/votacion', (req, res) => {
  const { rating, nombre, email } = req.body;

  if (!rating || rating == 0) {
    return res.status(400).json({ message: 'Por favor, ingrese un puntaje' });
  }

  registrar_voto(rating, nombre, email)
    .then(conexion => {
      if (conexion == 'hecho') {
        cache.del(['artistas', 'esculturas', 'eventos']);
        return res.status(200).json({ success: true, message: 'Voto realizado correctamente'});
      } else {
        return res.status(401).json({ success: false, message: 'Voto no realizado' });
      }

    })
    .catch(error => {
      console.error('Error en la conexión:', error);
      if (error.code == 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'Ya votaste esta obra' });
      }
      return res.status(500).json({ success: false, message: 'Error en el servidor' });
    });
});

//InsertarEventos
app.post('/api/eventoNuevo', async (req, res) => {
  //console.log("Se llamó al insertar evento")
  const { nombre, lugar, tematica, fecha_inicio, fecha_fin, hora_inicio, hora_fin } = req.body;

  try {
    const resultado = await insertarEvento({ nombre, lugar, tematica, fecha_inicio, fecha_fin, hora_inicio, hora_fin });
    cache.del(['eventos']);
    res.json({ mensaje: 'Evento creado con éxito', resultado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al insertar el evento en la base de datos' });
  }
});

// Endpoint para registrar un nuevo artista


app.post('/api/artistaNuevo', upload.single('imagenPerfil'), async (req, res) => {
  console.log(req.body);
  const { dni, nombre, apellido, biografia, email, contrasena } = req.body;
  
  const imagenPerfil = req.file; // La imagen viene en 'imagenPerfil' debido a 'upload.single('imagenPerfil')'
  // Verifica si la imagen fue cargada
  console.log(imagenPerfil);
  
  if (!imagenPerfil) {
    return res.status(400).json({ error: 'La imagen de perfil es requerida' });
  }

  try {
    // Convertir la imagen a WebP usando sharp
    let imagenWebpBuffer = await sharp(imagenPerfil.buffer)
      .webp()  // Convierte la imagen a WebP
      .toBuffer();  // Obtiene el buffer de la imagen convertida

    // Verifica que el resultado sea un Buffer
    if (!(imagenWebpBuffer instanceof Buffer)) {
      imagenWebpBuffer = Buffer.from(imagenWebpBuffer); // Si es un ArrayBuffer, conviértelo a Buffer
    }

    console.log(imagenWebpBuffer);  // Verifica el buffer convertido

    // Procesar el resto de la lógica
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const artista = {
      DNI: dni,           // Asignar los valores con los nombres que espera tu función
      NyA: `${nombre} ${apellido}`,
      res_biografia: biografia,
      contacto: email,
      contrasena: hashedPassword,  
    };

    // Insertar el artista con el buffer convertido a WebP
    const artistaId = await insertarArtista(artista, imagenWebpBuffer); // Usar el buffer convertido en lugar del original
    cache.del(['artistas']);
    res.status(200).json({ mensaje: 'Artista registrado con éxito', artistaId });
  } catch (error) {
    console.error('Error al registrar artista:', error);
    res.status(500).json({ error: 'Hubo un error al registrar el artista' });
  }
});

// Endpoint para registrar una escultura
app.post('/api/esculturaNueva', async (req, res) => {
  console.log("Llama a crear Escultura")
  const { nombre, f_creacion, antecedentes, tecnica } = req.body;

  if (!nombre || !f_creacion || antecedentes == null || !tecnica) {
    console.log("Falta Algo")
    console.log(nombre,f_creacion,antecedentes,tecnica)
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    
  }

  try {
    const resultado = await registrar_escultura(nombre, f_creacion, antecedentes, tecnica);
    cache.del(['esculturas']);
    
    
    res.status(200).json({ mensaje: 'Escultura registrada con éxito', resultado });
  } catch (error) {
    console.error('Error al registrar escultura:', error);
    res.status(500).json({ error: 'Error al registrar la escultura' });
  }
});

// Endpoint para registrar relación "hechas_por"
app.post('/api/hechasPorNueva', async (req, res) => {
  const { DNI, nombre_escultura } = req.body;

  if (!DNI || !nombre_escultura) {
    console.log("Faltan Datos")
    return res.status(400).json({ error: 'DNI y nombre de escultura son obligatorios' });

  }

  try {
    const resultado = await registrar_hechas_por(DNI, nombre_escultura);
    res.status(200).json({ mensaje: 'Relación registrada con éxito', resultado });
  } catch (error) {
    console.error('Error al registrar relación hechas_por:', error);
    res.status(500).json({ error: 'Error al registrar la relación' });
  }
});

// Endpoint para registrar una imagen
app.post('/api/imagenNueva', upload.single('imagen'), async (req, res) => {
  const { etapa, nombre_escultura } = req.body;
  const imagen = req.file; // Se obtiene la imagen desde el request

  // Verificación de campos obligatorios
  if (!etapa || !nombre_escultura || !imagen) {
    return res.status(400).json({ error: 'Todos los campos y la imagen son obligatorios' });
  }

  try {
    // Llamamos a la función para registrar la imagen en la base de datos
    const resultado = await registrar_imagen(etapa, nombre_escultura, imagen);
    res.status(200).json({ mensaje: 'Imagen registrada con éxito', resultado });
  } catch (error) {
    console.error('Error al registrar imagen:', error);
    res.status(500).json({ error: 'Error al registrar la imagen' });
  }
});

// Endpoint para registrar relación "compiten"
app.post('/api/compitenNuevo', async (req, res) => {
  const { nombre_evento, nombre_escultura } = req.body;
  console.log("Entra a compiten nuevo")
  console.log(nombre_evento,nombre_escultura)

  if (!nombre_evento || !nombre_escultura) {
    return res.status(400).json({ error: 'Nombre del evento y nombre de la escultura son obligatorios' });
  }

  try {
    const resultado = await registrar_compiten(nombre_evento, nombre_escultura);
    res.status(200).json({ mensaje: 'Relación registrada con éxito', resultado });
  } catch (error) {
    console.error('Error al registrar relación compiten:', error);
    res.status(500).json({ error: 'Error al registrar la relación' });
  }
});

app.post('/api/borrarEvento', async (req, res) => {
  const { nombre_evento, lugar_evento } = req.body;

  // Verificación de campos obligatorios
  if (!nombre_evento || !lugar_evento) {
    return res.status(400).json({ error: 'El nombre y lugar del evento son obligatorios' });
  }

  try {
    // Llamamos a la función para borrar el evento
    const resultado = await borrar_evento(nombre_evento, lugar_evento);
    cache.del(['eventos']);
    res.status(200).json({ mensaje: 'Evento borrado con éxito', resultado });
  } catch (error) {
    console.error('Error al borrar el evento:', error);
    res.status(500).json({ error: 'Error al borrar el evento' });
  }
});


app.post('/api/modificarEvento', async (req, res) => {
  const {
    nombre_evento_actual,
    lugar_evento_actual,
    nombre_evento_nuevo,
    lugar_evento_nuevo,
    fecha_inicio,
    fecha_fin,
    tematica,
    hora_inicio,
    hora_fin
  } = req.body;

  // Verificación de campos obligatorios
  if (!nombre_evento_actual || !lugar_evento_actual || !nombre_evento_nuevo || !lugar_evento_nuevo) {
    return res.status(400).json({ error: 'Los campos actuales y nuevos de nombre y lugar del evento son obligatorios' });
  }

  try {
    // Llamamos a la función para modificar el evento
    const resultado = await modificar_evento(
      nombre_evento_actual,
      lugar_evento_actual,
      nombre_evento_nuevo,
      lugar_evento_nuevo,
      fecha_inicio,
      fecha_fin,
      tematica,
      hora_inicio,
      hora_fin
    );
    cache.del(['eventos']);
    res.status(200).json({ mensaje: 'Evento modificado con éxito', resultado });
  } catch (error) {
    console.error('Error al modificar el evento:', error);
    res.status(500).json({ error: 'Error al modificar el evento' });
  }
});

app.post('/api/modificarArtista', async (req, res) => {
  const {
    dni_resguardado,
    nombre,
    apellido,
    dni,
    biografia,
    email,
    contraseña,
    imagenPerfil
  } = req.body;
  console.log(req.body);
  try {
    // Llamamos a la función para modificar el evento
    const resultado = await modificar_artista(
      req.body.dni_resguardado,
      req.body.nombre_actual,
      req.body.apellido_actual,
      req.body.dni_nuevo,
      req.body.biografia_nuevo,
      req.body.email_nuevo,
      req.body.contraseña_nueva,
      req.body.imagenPerfil_nueva
    );
    cache.del(['artistas']);
    res.status(200).json({ mensaje: 'Artista modificado con éxito', resultado });
  } catch (error) {
    console.error('Error al modificar el artista:', error);
    res.status(500).json({ error: 'Error al modificar el artista' });
  }
});


app.post('/api/borrarArtista', async (req, res) => {
  const { dni } = req.body;
  console.log("Se llama al 1er")
  console.log(dni)

  // Verificación de campos obligatorios
  if (!dni) {
    return res.status(400).json({ error: 'El DNI del artista es obligatorio' });
  }

  try {
    // Llamamos a la función para borrar el artista
    const resultado = await borrar_artista(dni);
    // Si deseas limpiar algún cache relacionado con artistas, puedes hacerlo aquí
    cache.del(['artistas']); 
    res.status(200).json({ mensaje: 'Artista borrado con éxito', resultado });
  } catch (error) {
    console.error('Error al borrar el artista:', error);
    res.status(500).json({ error: 'Error al borrar el artista' });
  }
});


app.post('/api/borrarEscultura', async (req, res) => {
  const { nombreEscultura } = req.body;
  console.log("Se llama al 1er para borrar escultura");
  console.log(nombreEscultura);

  // Verificación de campos obligatorios
  if (!nombreEscultura) {
    return res.status(400).json({ error: 'El nombre de la escultura es obligatorio' });
  }

  try {
    // Llamamos a la función para borrar la escultura
    const resultado = await borrar_escultura(nombreEscultura);

    // Si deseas limpiar algún cache relacionado con esculturas, puedes hacerlo aquí
    cache.del(['esculturas']);

    res.status(200).json({ mensaje: 'Escultura borrada con éxito', resultado });
  } catch (error) {
    console.error('Error al borrar la escultura:', error);
    res.status(500).json({ error: 'Error al borrar la escultura' });
  }
});





app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});