<script>
  let isNavOpen = false;
  let logo = "https://raw.githubusercontent.com/FRRe-DS/2024-06-TPI/main/client/src/public/bienal_logo.png";
</script>

<!-- Main navigation container -->
<nav class="flex-no-wrap relative flex w-full items-center justify-between py-2 shadow-dark-mild lg:flex-wrap lg:justify-start lg:py-4 shadow-lg" style="background: linear-gradient(to top, rgb(109, 46, 1), rgba(109, 46, 1, 0.8));">
  <div class="flex w-full flex-wrap items-center justify-between px-3">

    <!-- Hamburger button for mobile view -->
    <button
      class="block border-0 bg-transparent px-2 text-black/50 hover:no-underline hover:shadow-none focus:no-underline focus:shadow-none focus:outline-none focus:ring-0 dark:text-neutral-200 lg:hidden"
      type="button"
      on:click={() => isNavOpen = !isNavOpen}
      aria-controls="navbarSupportedContent1"
      aria-expanded={isNavOpen}
      aria-label="Toggle navigation"
    >
      <!-- Hamburger icon -->
      <span class="[&>svg]:w-7 [&>svg]:stroke-black/50 dark:[&>svg]:stroke-neutral-200">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path fill-rule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clip-rule="evenodd" />
        </svg>
      </span>
    </button>

    <!-- Collapsible navigation container -->
    <div
      class={`!visible ${isNavOpen ? 'flex' : 'hidden'} flex-grow basis-[100%] items-center lg:!flex lg:basis-auto`}
      id="navbarSupportedContent1"
    >
      <!-- Logo -->
      <a class="mb-4 me-5 ms-2 mt-3 flex items-center text-neutral-900 hover:text-neutral-900 focus:text-neutral-900 dark:text-neutral-200 dark:hover:text-neutral-400 dark:focus:text-neutral-400 lg:mb-0 lg:mt-0" href="https://github.com/FRRe-DS/2024-06-TPI">
        <img
          class="me-2"
          src={logo}
          style="max-height: 35px"
          alt="logo bienal"
          loading="lazy" />
      </a>
      <!-- Left navigation links -->
      <ul class="list-style-none flex flex-row justify-center flex-grow ps-0">
        <li class="mb-4 lg:mb-0 lg:pe-14"> <!-- Ajusta aquí el espacio -->
          <a class="block transition duration-200 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg px-3 py-2 text-black/60 hover:text-black/80 focus:text-black/80 dark:text-white/60 dark:hover:text-white/80 dark:focus:text-white/80" href="/inicio">Inicio</a>
        </li>
        <li class="mb-4 lg:mb-0 lg:pe-14"> <!-- Ajusta aquí el espacio -->
          <a class="block transition duration-200 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg px-3 py-2 text-black/60 hover:text-black/80 focus:text-black/80 dark:text-white/60 dark:hover:text-white/80 dark:focus:text-white/80" href="/eventos">Eventos</a>
        </li>
        <li class="mb-4 lg:mb-0 lg:pe-14"> <!-- Ajusta aquí el espacio -->
          <a class="block transition duration-200 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg px-3 py-2 text-black/60 hover:text-black/80 focus:text-black/80 dark:text-white/60 dark:hover:text-white/80 dark:focus:text-white/80" href="/escultores">Escultores</a>
        </li>
        <li class="mb-4 lg:mb-0 lg:pe-14"> <!-- Ajusta aquí el espacio -->
          <a class="block transition duration-200 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg px-3 py-2 text-black/60 hover:text-black/80 focus:text-black/80 dark:text-white/60 dark:hover:text-white/80 dark:focus:text-white/80" href="/obras">Obras</a>
        </li>
      </ul>
    </div>

    <!-- Redes sociales -->
    <div class="flex items-center space-x-4">
      <!-- Facebook -->
      <a href="https://www.facebook.com" target="_blank" class="text-neutral-600 dark:text-white hover:text-blue-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22.675 0H1.325C.595 0 0 .594 0 1.325v21.351C0 23.406.595 24 1.325 24h11.494v-9.294H9.691v-3.622h3.128V8.413c0-3.1 1.894-4.788 4.661-4.788 1.325 0 2.463.099 2.794.144v3.24h-1.917c-1.504 0-1.795.715-1.795 1.762v2.309h3.589l-.467 3.622h-3.122V24h6.117C23.406 24 24 23.406 24 22.676V1.325C24 .594 23.406 0 22.675 0z"/>
        </svg>
      </a>
      <!-- Twitter -->
      <a href="https://www.twitter.com" target="_blank" class="text-neutral-600 dark:text-white hover:text-blue-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 4.557a9.93 9.93 0 01-2.828.775 4.932 4.932 0 002.165-2.723 9.864 9.864 0 01-3.127 1.195 4.92 4.92 0 00-8.388 4.482A13.978 13.978 0 011.671 3.149a4.921 4.921 0 001.523 6.573 4.903 4.903 0 01-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.935 4.935 0 01-2.224.085 4.923 4.923 0 004.6 3.417 9.869 9.869 0 01-6.102 2.104c-.396 0-.79-.023-1.177-.069a13.945 13.945 0 007.557 2.213c9.054 0 14.002-7.504 14.002-14.002 0-.213-.005-.425-.015-.637A10.025 10.025 0 0024 4.557z"/>
        </svg>
      </a>
      <!-- Instagram -->
      <a href="https://www.instagram.com" target="_blank" class="text-neutral-600 dark:text-white hover:text-pink-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.349 3.608 1.324.975.975 1.262 2.242 1.324 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.349 2.633-1.324 3.608-.975.975-2.242 1.262-3.608 1.324-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.349-3.608-1.324-.975-.975-1.262-2.242-1.324-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.349-2.633 1.324-3.608.975-.975 2.242-1.262 3.608-1.324 1.266-.058 1.646-.07 4.85-.07zm0-2.163C8.742 0 8.332 0 7.052.073 5.762.147 4.713.366 3.828 1.25c-.885.885-1.104 1.934-1.177 3.224C2.5 5.979 2.5 6.389 2.5 12s0 6.021.073 7.301c.073 1.29.292 2.339 1.177 3.224.885.885 1.934 1.104 3.224 1.177 1.28.073 1.69.073 7.301.073s6.021 0 7.301-.073c1.29-.073 2.339-.292 3.224-1.177.885-.885 1.104-1.934 1.177-3.224.073-1.28.073-1.69.073-7.301s0-6.021-.073-7.301c-.073-1.29-.292-2.339-1.177-3.224-.885-.885-1.934-1.104-3.224-1.177-1.28-.073-1.69-.073-7.301-.073z"/>
          <path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.141a3.979 3.979 0 110-7.957 3.979 3.979 0 010 7.957zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"/>
        </svg>
      </a>
      <!-- YouTube -->
      <a href="https://www.youtube.com" target="_blank" class="text-neutral-600 dark:text-white hover:text-red-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.615 3.184c-.565-.422-1.19-.577-2.058-.608C15.513 2.5 12 2.5 12 2.5s-3.513 0-5.557.076c-.868.031-1.493.186-2.058.608-.565.421-.953 1.014-1.126 1.908C3 6.454 3 8.991 3 8.991s0 2.537.259 4.899c.173.894.561 1.487 1.126 1.908.565.422 1.19.577 2.058.608C8.487 16.5 12 16.5 12 16.5s3.513 0 5.557-.076c.868-.031 1.493-.186 2.058-.608.565-.421.953-1.014 1.126-1.908.259-2.362.259-4.899.259-4.899s0-2.537-.259-4.899c-.173-.894-.561-1.487-1.126-1.908zM9.545 13.568V7.927l5.455 2.82-5.455 2.82z"/>
        </svg>
      </a>
      <!-- Selector de idioma (Mundo) -->
      <a href="#" class="text-neutral-600 dark:text-white hover:text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm7.93 9H15.71a15.992 15.992 0 00-1.264-5.98A8.015 8.015 0 0119.93 11zM12 20c-.872 0-1.718-.816-2.401-2.198a14.042 14.042 0 012.401-1.3 14.042 14.042 0 012.401 1.3C13.718 19.184 12.872 20 12 20zm-2.099-2.198A15.992 15.992 0 008.29 13H4.07a8.015 8.015 0 007.93 7zm-.529-7c.186-1.148.443-2.236.762-3.248a12.16 12.16 0 011.742 0c.32 1.012.576 2.1.762 3.248H9.372zm5.682 0H14.63c-.186-1.148-.443-2.236-.762-3.248a12.16 12.16 0 00-1.742 0c-.32 1.012-.576 2.1-.762 3.248h4.689zM6.553 5.02A15.992 15.992 0 017.29 11H4.07a8.015 8.015 0 012.482-5.98zM9.29 11a14.042 14.042 0 012.401-1.3A14.042 14.042 0 0114.09 11H9.29zm2.099-7c.872 0 1.718.816 2.401 2.198A15.992 15.992 0 0012 6.301a15.992 15.992 0 00-1.791-.103C10.282 4.816 11.128 4 12 4zm5.447 1.98A8.015 8.015 0 0119.93 11h-3.22a15.992 15.992 0 00-1.264-5.98zM14.71 13h4.22a8.015 8.015 0 01-7.93 7 15.992 15.992 0 001.264-5.98z"/>
        </svg>
      </a>
    </div>
  </div>
</nav>
