import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { ArtistasConsulta, EsculturasConsulta, EventosConsulta, login} from './conexiondb.js';
import { ordenarEsculturas, buscarEsculturas, buscarArtistas,ordenarArtistas } from './filtrosObjetos.js';

const app = express();
const port = 3001;
let esculturas = [];
let artistas=[];

app.use(cors()); // Permitir CORS
// Middleware para analizar el cuerpo de la solicitud (JSON)
app.use(bodyParser.json());
app.use(cookieParser());


// Crear una función asincrónica para manejar las consultas a la base de datos
const obtenerArtistas = async (busqueda,orden) => {
  try {
    if (artistas.length == 0) {
      artistas = await ArtistasConsulta();
    }
    if (!Array.isArray(artistas)) {
      throw new Error('La consulta no devolvió un array');
    }
    
    const artistasFiltrados = buscarArtistas(artistas, busqueda);
    const artistasOrdenados = ordenarArtistas(artistasFiltrados, orden);

    const cards = [];
    for (let [index, artista] of artistasOrdenados.entries()) {
      // Accede a los métodos de la clase Artistas
      const docartista = artista.getDNI();
      const nombreartista = artista.getNyA();
      const bioartista = artista.getRes_biografia();
      const contactoartista = artista.getContacto();
      const fotoartista = artista.getURL_foto();

      cards.push({
        id: index + 1,
        title: 'Carta ' + (index + 1),
        escultorPantalla:'/escultores/'+nombreartista.replace(/ /g, ''),
        escultordni:docartista, //en el front no vi que ocupen este pero igual
        escultorFoto:fotoartista,
        escultorName:nombreartista,
        contactoEmail:contactoartista,
        content:bioartista,
      });
    }

    return cards;

  } catch (error) {
    console.error('Error al obtener artistas:', error);
    return [];  // Retornar un array vacío en caso de error
  }
};

const obtenerEsculturas = async (busqueda,criterio,orden) => {
  try {
    if (esculturas.length == 0) {
      esculturas = await EsculturasConsulta();
    }
    // Asegúrate de que esculturas es un array
    if (!Array.isArray(esculturas)) {
      throw new Error('La consulta no devolvió un array');
    }
    const esculturasFiltradas = buscarEsculturas(esculturas, busqueda);
    const esculturasOrdenadas = ordenarEsculturas(esculturasFiltradas, criterio, orden);

    const cards = [];
    for (const [index, escultura] of esculturasOrdenadas.entries()) {
      // Accede a los métodos de la clase Esculturas
      const listaObraImagenes = escultura.getImagenes();
      const obraImagen = listaObraImagenes[0].getURL();
      const tecnica = escultura.getTecnica();
      const obraNombre = escultura.getNombre();
      const obraArtistas = escultura.getArtistas();
      const obraArtista = obraArtistas[0].getNyA();
      const obraEscultorFoto = obraArtistas[0].getURL_foto();
      const average = escultura.getPromedio();
      const fecha_creacion = escultura.getFechaCreacion();
      const promedioEstrellas = escultura.getPromedio();

      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const formattedFecha_creacion = fecha_creacion.toLocaleDateString('es-ES', options);

      cards.push({
        id: index + 1,
        title: 'Carta' + (index + 1),
        obraPantalla: '/obras/' + obraNombre.replace(/ /g, ''),
        obraImage: obraImagen,
        content: tecnica,
        obraName: obraNombre,
        obraEscultor: obraArtista,
        obraEscultorFoto: obraEscultorFoto,
        promedio: average,
        f_creacion: formattedFecha_creacion,
        promedio: promedioEstrellas
      });
    }

    return cards;

  } catch (error) {
    console.error('Error al obtener esculturas:', error);
    return [];  // Retornar un array vacío en caso de error
  }
};

const obtenerEventos = async (busqueda) => {
  try {
    const eventos = await EventosConsulta('nombre', 'DESC', busqueda, 20);

    // Asegúrate de que esculturas es un array
    if (!Array.isArray(eventos)) {
      throw new Error('La consulta no devolvió un array');
    }

    const cards = [];

    for (const [index, evento] of eventos.entries()) {
      // Accede a los métodos de la clase Eventos
      const titulo = evento.getNombre();
      const fechaInicio = new Date(evento.getFechaInicio());
      const fechaFin = new Date(evento.getFechaFin());
      const tematica = evento.getTematica();
      const lugar = evento.getLugar();
      const horaInicio = evento.getHoraInicio();
      const horaFin = evento.getHoraFin();

      const options = {month: 'long', day: 'numeric' };
      const formattedFechaInicio = fechaInicio.toLocaleDateString('es-ES', options);
      const formattedFechaFin = fechaFin.toLocaleDateString('es-ES', options);

      const formattedHoraInicio = horaInicio.split(':').slice(0, 2).join(':');  // De "09:30:00" a "09:30"
      const formattedHoraFin = horaFin.split(':').slice(0, 2).join(':');        // De "15:00:00" a "15:00"


      cards.push({
        title: 'evento' + (index + 1),
        href: titulo.replace(/ /g, ''),
        eventName: titulo,
        eventStartDate: formattedFechaInicio,
        eventFinishDate: formattedFechaFin,
        startTime: formattedHoraInicio,
        finishTime: formattedHoraFin,
        location: lugar,
        content: tematica
      });
    }

    return cards;

  } catch (error) {
    console.error('Error al obtener eventos:', error);
    return [];  // Retornar un array vacío en caso de error
  }
};

// Endpoint para obtener escultores
app.get('/api/escultores', async (req, res) => {
  const searchQuery = req.query.search;
  const cards = await obtenerArtistas(searchQuery,'DESC');  // desc solo está explícito para probar si funciona, después se configura en el front
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

app.get('/api/eventos', async (req, res) => {
  const searchQuery = req.query.search;
  const cards = await obtenerEventos(searchQuery);  // Esperamos a que se procesen todas las consultas
  res.json(cards);
});

app.post('/api/login', (req, res) => {
  const { correo, contraseña } = req.body;

  // Verificar si se ingresaron correo y contraseña
  if (!correo || !contraseña) {
    return res.status(400).json({ message: 'Por favor ingrese correo y contraseña' });
  }

  login(correo, contraseña)
    .then(conexion => {
      // Aquí es donde manejamos los resultados
      if (conexion && conexion.length > 0) {
        // Establecer la cookie antes de enviar la respuesta
        res.cookie('correo', correo, { httpOnly: true, maxAge: 3600000 }); // Cookie válida por 1 hora
        return res.status(200).json({ success: true, message: 'Inicio de sesión exitoso' });
      } else {
        return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
      }
    })
    .catch(error => {
      // En caso de error, enviamos una respuesta con estado 500
      console.error('Error en la conexión:', error);
      return res.status(500).json({ success: false, message: 'Error en el servidor' });
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
