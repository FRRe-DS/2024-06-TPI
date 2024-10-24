<script>
  import { onMount } from "svelte";
  import axios from "axios";
  let searchQuery = ""; // Valor de la búsqueda
    /**
    * @type {any[]}
    */
  let cards = []; // Resultado de las esculturas
  let filteredCards = []; // Resultado filtrado
  
  // Función para realizar la búsqueda
  async function fetchEscultores(query = "") {
    try {
      const res = await axios.get(`http://localhost:3001/api/escultores`, {
        params: { search: query }
      });
      cards = res.data;
      filteredCards = cards; // Actualiza la lista mostrada
    } catch (error) {
      console.log(error);
    }
  }

  // Ejecutar la consulta inicial cuando se monta la página
  onMount(() => {
    fetchEscultores(); // Sin query al principio
  });
</script>

<div class="search-container">
  <input id="1"
    type="text"
    class="search-input"
    bind:value="{searchQuery}"
    placeholder="Buscar escultor..."
  />
  <button class="search-button" on:click="{() => fetchEscultores(searchQuery)}">Buscar</button>
</div>

<!-- Contenedor de las cards -->
<div class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-4">
    {#each cards as card}
        <div class="block rounded-lg bg-white shadow-secondary-1 m-2.5 border-2 border-gray-300 rounded-md">
            <div class="relative overflow-hidden bg-cover bg-no-repeat">
                <a href={card.escultorPantalla}>
                    <img
                        src={card.escultorFoto}
                        class="w-32 rounded-full"
                        alt="Avatar" />
                    <div class="absolute bottom-0 left-0 right-0 top-0 h-full w-full overflow-hidden bg-[hsla(0,0%,98%,0.15)] bg-fixed opacity-0 transition duration-300 ease-in-out hover:opacity-100"></div>
                </a>    
            </div>
            <div class="p-6 text-surface dark:text-white">
                <h5 class="mb-2 text-xl font-medium leading-tight text-black">
                    {card.escultorName}
                </h5>
                <p class="mb-4 text-base text-left text-black">{card.content}</p>
                
                <!-- Nuevo bloque para el contacto -->
                <p class="text-sm text-left text-gray-600">
                    Contacto: <a href="mailto:{card.contactoEmail}" class="text-blue-600 hover:underline">{card.contactoEmail}</a>
                </p>
            </div>
        </div>
    {/each}
</div>

<style>
  .search-container {
    display: flex;
    justify-content: center; /* Centra horizontalmente */
    align-items: center; /* Centra verticalmente */
    margin-top: 20px; /* Espaciado superior */
  }

  .search-input {
    padding: 10px; /* Espaciado interno */
    border: 2px solid #ccc; /* Color y grosor del borde */
    border-radius: 5px; /* Esquinas redondeadas */
    margin-right: 10px; /* Espaciado entre el input y el botón */
    font-size: 16px; /* Tamaño de la fuente */
    width: 250px; /* Ancho del input */
    transition: border-color 0.3s; /* Transición para el color del borde */
  }

  .search-input:focus {
    border-color: #86512c; /* Cambia el color del borde al hacer foco */
    outline: none; /* Elimina el contorno por defecto */
  }

  .search-button {
    padding: 10px 15px; /* Espaciado interno */
    background-color: #713307; /* Color de fondo del botón */
    color: white; /* Color del texto */
    border: none; /* Sin borde */
    border-radius: 5px; /* Esquinas redondeadas */
    cursor: pointer; /* Cambia el cursor al pasar el mouse */
    font-size: 16px; /* Tamaño de la fuente */
    transition: background-color 0.3s; /* Transición para el color de fondo */
  }

  .search-button:hover {
    background-color: #7c4218; /* Color de fondo al pasar el mouse */
  }
</style>
