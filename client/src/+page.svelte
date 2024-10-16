
<script context="module" lang="ts">
    import { redirect } from '@sveltejs/kit';

    // Redirige a la ruta '/inicio'
    export const load = () => {
        throw redirect(302, '/inicio');
    };
</script>

<!-- Puedes dejar el contenido vacío si solo necesitas la redirección -->
<main>

    <h1>redirigiendo....</h1>
</main>