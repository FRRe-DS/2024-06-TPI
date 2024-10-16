
<!-- src/routes/+layout.svelte -->
<script>
  let logo = "https://raw.githubusercontent.com/FRRe-DS/2024-06-TPI/main/client/src/public/bienal_logo_corto.png";
  let anio= 2024;
  import Navbar from '../components/layout/Navbar.svelte';
  import Footer from '../components/layout/Footer.svelte';
</script>

<svelte:head>
  <title>Bienal 2024 {anio}</title>
  <link rel="icon" type="image/x-icon" href={logo} style="max-height: 16px; max-width: 16px" class="bg-" />
</svelte:head>

<main>

  <Navbar />
  
  <slot></slot> <!-- Aquí se renderizarán las páginas hijas -->
  
  <Footer />

</main>

<style>
  /* Agrega estilos generales aquí */
  
  @tailwind base;
  @tailwind components;
  @tailwind utilities;


:global(body) {
  font-family: 'Roboto', sans-serif;
}

</style>
