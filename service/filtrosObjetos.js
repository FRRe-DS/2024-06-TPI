export function ordenarEsculturas(listaEsculturas, criterio, orden) {
    return listaEsculturas.sort((a, b) => {
        let comparison = 0;

        // Comparación según el criterio seleccionado
        switch (criterio) {
            case 'nombre':
                comparison = a.getNombre().localeCompare(b.getNombre());
                break;

            case 'f_creacion':
                comparison = new Date(a.getFechaCreacion()) - new Date(b.getFechaCreacion());
                break;

            case 'promedio':
                comparison = parseFloat(a.getPromedio()) - parseFloat(b.getPromedio());
                break;

            default:
                console.error('Criterio no reconocido: ' + criterio);
                return 0;
        }

        // Ajuste según el orden (ascendente o descendente)
        if (orden === 'DESC') {
            comparison = comparison * -1; // Invierte el orden para descendente
        }

        return comparison;
    });
}

export function buscarEsculturas(listaEsculturas, busqueda) {
    busqueda = busqueda.toLowerCase(); // Convertir la búsqueda a minúsculas
    const resultados = [];

    listaEsculturas.forEach(escultura => {
        // Validar que la escultura no sea undefined y que tenga los métodos necesarios
        if (escultura && typeof escultura.getNombre === 'function' && typeof escultura.getTecnica === 'function') {
            // Verificar coincidencias en el nombre y técnica
            const nombreEscultura = escultura.getNombre() || ""; // Default a vacío si no está definido
            const tecnicaEscultura = escultura.getTecnica() || ""; // Default a vacío si no está definido

            if (nombreEscultura.toLowerCase().includes(busqueda) ||
                tecnicaEscultura.toLowerCase().includes(busqueda)) {
                resultados.push(escultura);
                return;
            }

            // Verificar coincidencias en la lista de artistas
            let artistas = escultura.getArtistas(); // Obtener la lista de artistas

            if (Array.isArray(artistas)) {
                for (const artista of artistas) {
                    // Validar que el artista tenga nombre 
                    if (artista && artista.NyA) {
                        if (artista.NyA.toLowerCase().includes(busqueda)) {
                            resultados.push(escultura);
                            break; // No es necesario seguir buscando más artistas
                        }
                    }
                }
            }
        }
    });

    return resultados;
}
export function ordenarArtistas(listaArtistas,orden) {
    
    return listaArtistas.sort((a, b) => {
        let comparison=0;
        comparison = a.getNyA().localeCompare(b.getNyA());
        // Ajuste según el orden (ascendente o descendente)
        if (orden === 'DESC') {
            comparison = comparison * -1; // Invierte el orden para descendente
        }
        return comparison
    });
};

export function buscarArtistas(listaArtistas, busqueda) {
    let resultados=[];
     // Convertir la búsqueda a minúsculas
    if (busqueda==""){
        listaArtistas.forEach(artista => {
            // Validar que el artista no sea undefined y que tenga los métodos necesarios
            if (artista && typeof artista.getNyA === 'function') {
                resultados.push(artista)}
            })
    }else{busqueda = busqueda.toLowerCase();
        listaArtistas.forEach(artista => {
        if (artista && artista.NyA && typeof artista.getNyA === 'function') {
                if (artista.NyA.toLowerCase().includes(busqueda)) {
                    resultados.push(artista);
                }
        }
        })
    }
    return resultados;
}
