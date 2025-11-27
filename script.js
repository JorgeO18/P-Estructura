// Configuración
const VELOCIDAD_MENSAJERO = 1.4; // m/s (aproximadamente 5 km/h caminando)
const TIEMPO_ENTREGA_PAQUETE = 30; // segundos por paquete entregado

// Estructura del grafo con las distancias entre bloques
const grafo = {
    'BLOQUE A': {
        'BLOQUE B': 110.58,
        'BLOQUE C': 120.38,
        'RANCHOS': 108.58
    },
    'BLOQUE B': {
        'BLOQUE A': 110.58,
        'BLOQUE D': 41.06,
        'BLOQUE C': 45.34
    },
    'BLOQUE C': {
        'BLOQUE A': 120.38,
        'BLOQUE B': 45.34,
        'BLOQUE D': 61.98,
        'BLOQUE E': 78.42,
        'BLOQUE F': 68.21,
        'RANCHOS': 117.48
    },
    'BLOQUE D': {
        'BLOQUE B': 41.06,
        'BLOQUE C': 61.98,
        'BLOQUE F': 58.38,
        'BLOQUE G': 114.59
    },
    'BLOQUE E': {
        'BLOQUE C': 78.42,
        'BLOQUE F': 98.49,
        'RANCHOS': 100.54
    },
    'BLOQUE F': {
        'BLOQUE C': 68.21,
        'BLOQUE D': 58.38,
        'BLOQUE E': 98.49,
        'BLOQUE G': 98.14
    },
    'BLOQUE G': {
        'BLOQUE D': 114.59,
        'BLOQUE F': 98.14
    },
    'RANCHOS': {
        'BLOQUE A': 108.58,
        'BLOQUE C': 117.48,
        'BLOQUE E': 100.54
    }
};

// Posiciones de los nodos en el mapa (coordenadas para SVG) - Mejoradas para mejor visualización
const posiciones = {
    'BLOQUE A': { x: 400, y: 520 },
    'BLOQUE B': { x: 180, y: 480 },
    'BLOQUE C': { x: 400, y: 360 },
    'BLOQUE D': { x: 180, y: 320 },
    'BLOQUE E': { x: 620, y: 320 },
    'BLOQUE F': { x: 520, y: 200 },
    'BLOQUE G': { x: 300, y: 100 },
    'RANCHOS': { x: 680, y: 480 }
};

// Estado de la aplicación
let paquetes = [];
let recorridos = [];
let idPaqueteCounter = 1;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    dibujarMapa();
    inicializarEventos();
    actualizarListaPaquetes();
    actualizarEstadisticas();
});

// Dibujar el mapa del campus
function dibujarMapa() {
    const svg = document.getElementById('mapa');
    svg.innerHTML = '';

    // Definir gradientes para los nodos
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Gradiente para el origen (Bloque A)
    const gradientOrigen = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradientOrigen.setAttribute('id', 'gradient-origen');
    gradientOrigen.setAttribute('x1', '0%');
    gradientOrigen.setAttribute('y1', '0%');
    gradientOrigen.setAttribute('x2', '100%');
    gradientOrigen.setAttribute('y2', '100%');
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#66BB6A');
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#4CAF50');
    gradientOrigen.appendChild(stop1);
    gradientOrigen.appendChild(stop2);
    defs.appendChild(gradientOrigen);

    // Gradiente para otros bloques
    const gradientBloque = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradientBloque.setAttribute('id', 'gradient-bloque');
    gradientBloque.setAttribute('x1', '0%');
    gradientBloque.setAttribute('y1', '0%');
    gradientBloque.setAttribute('x2', '100%');
    gradientBloque.setAttribute('y2', '100%');
    const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', '0%');
    stop3.setAttribute('stop-color', '#42A5F5');
    const stop4 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop4.setAttribute('offset', '100%');
    stop4.setAttribute('stop-color', '#2196F3');
    gradientBloque.appendChild(stop3);
    gradientBloque.appendChild(stop4);
    defs.appendChild(gradientBloque);

    svg.appendChild(defs);

    // Dibujar conexiones (edges)
    Object.keys(grafo).forEach(nodo => {
        Object.keys(grafo[nodo]).forEach(vecino => {
            const pos1 = posiciones[nodo];
            const pos2 = posiciones[vecino];
            const distancia = grafo[nodo][vecino];

            // Línea de conexión con estilo mejorado
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', pos1.x);
            line.setAttribute('y1', pos1.y);
            line.setAttribute('x2', pos2.x);
            line.setAttribute('y2', pos2.y);
            line.setAttribute('stroke', '#b0bec5');
            line.setAttribute('stroke-width', '2.5');
            line.setAttribute('stroke-opacity', '0.6');
            line.setAttribute('class', 'conexion');
            svg.appendChild(line);

            // Fondo para la etiqueta de distancia
            const midX = (pos1.x + pos2.x) / 2;
            const midY = (pos1.y + pos2.y) / 2;
            const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bgRect.setAttribute('x', midX - 25);
            bgRect.setAttribute('y', midY - 12);
            bgRect.setAttribute('width', '50');
            bgRect.setAttribute('height', '16');
            bgRect.setAttribute('rx', '8');
            bgRect.setAttribute('fill', 'white');
            bgRect.setAttribute('stroke', '#e0e0e0');
            bgRect.setAttribute('stroke-width', '1');
            bgRect.setAttribute('opacity', '0.9');
            svg.appendChild(bgRect);

            // Etiqueta de distancia (en el punto medio)
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', midX);
            text.setAttribute('y', midY);
            text.setAttribute('font-size', '10');
            text.setAttribute('fill', '#555');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-weight', '600');
            text.textContent = `${distancia.toFixed(1)}m`;
            svg.appendChild(text);
        });
    });

    // Dibujar nodos
    Object.keys(posiciones).forEach(nodo => {
        const pos = posiciones[nodo];
        
        // Círculo exterior con sombra
        const shadowCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        shadowCircle.setAttribute('cx', pos.x);
        shadowCircle.setAttribute('cy', pos.y);
        shadowCircle.setAttribute('r', 32);
        shadowCircle.setAttribute('fill', nodo === 'BLOQUE A' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(33, 150, 243, 0.2)');
        shadowCircle.setAttribute('class', `nodo-shadow ${nodo.replace(/\s+/g, '-').toLowerCase()}`);
        svg.appendChild(shadowCircle);

        // Círculo del nodo principal
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pos.x);
        circle.setAttribute('cy', pos.y);
        circle.setAttribute('r', 28);
        if (nodo === 'BLOQUE A') {
            circle.setAttribute('fill', 'url(#gradient-origen)');
        } else {
            circle.setAttribute('fill', 'url(#gradient-bloque)');
        }
        circle.setAttribute('stroke', '#fff');
        circle.setAttribute('stroke-width', '4');
        circle.setAttribute('class', `nodo ${nodo.replace(/\s+/g, '-').toLowerCase()}`);
        circle.setAttribute('style', 'filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2)); cursor: pointer;');
        svg.appendChild(circle);

        // Etiqueta del nodo
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', pos.x);
        text.setAttribute('y', pos.y + 6);
        text.setAttribute('font-size', '12');
        text.setAttribute('fill', '#fff');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-weight', '700');
        text.setAttribute('style', 'filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));');
        text.textContent = nodo.replace('BLOQUE ', '');
        svg.appendChild(text);
    });
}

// Inicializar eventos
function inicializarEventos() {
    document.getElementById('agregarPaquete').addEventListener('click', agregarPaquete);
    document.getElementById('simularEnvio').addEventListener('click', simularEnvio);
    document.getElementById('limpiar').addEventListener('click', limpiarTodo);
}

// Agregar un paquete
function agregarPaquete() {
    const destino = document.getElementById('destino').value;
    const prioridad = document.getElementById('prioridad').value;

    const paquete = {
        id: idPaqueteCounter++,
        destino: destino,
        prioridad: prioridad
    };

    paquetes.push(paquete);
    
    actualizarListaPaquetes();
    actualizarEstadisticas();
}

// Actualizar lista de paquetes en el UI
function actualizarListaPaquetes() {
    const lista = document.getElementById('listaPaquetes');
    lista.innerHTML = '';

    if (paquetes.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'empty-message';
        emptyMsg.textContent = 'No hay paquetes pendientes';
        lista.appendChild(emptyMsg);
        return;
    }

    paquetes.forEach(paquete => {
        const item = document.createElement('div');
        item.className = `paquete-item ${paquete.prioridad}`;
        item.innerHTML = `
            <div class="paquete-info">
                <div class="paquete-destino">${paquete.destino}</div>
                <div class="paquete-details">ID: ${paquete.id}</div>
            </div>
            <span class="prioridad-badge ${paquete.prioridad}">${paquete.prioridad.toUpperCase()}</span>
        `;
        lista.appendChild(item);
    });
}

// Actualizar estadísticas
function actualizarEstadisticas() {
    const stats = document.getElementById('estadisticas');
    const total = paquetes.length;
    const urgentes = paquetes.filter(p => p.prioridad === 'urgente').length;
    const normales = paquetes.filter(p => p.prioridad === 'normal').length;
    const destinos = [...new Set(paquetes.map(p => p.destino))].length;

    stats.innerHTML = `
        <div class="stat-item">
            <span class="stat-label">Total Paquetes:</span>
            <span class="stat-value">${total}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Urgentes:</span>
            <span class="stat-value">${urgentes}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Normales:</span>
            <span class="stat-value">${normales}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Destinos Únicos:</span>
            <span class="stat-value">${destinos}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Recorridos Realizados:</span>
            <span class="stat-value">${recorridos.length}</span>
        </div>
    `;
    
    // Agregar tiempo total estimado si hay recorridos
    if (recorridos.length > 0) {
        const tiempoTotal = recorridos.reduce((sum, r) => sum + r.tiempoEstimado.total, 0);
        const tiempoTotalItem = document.createElement('div');
        tiempoTotalItem.className = 'stat-item stat-item-highlight';
        tiempoTotalItem.innerHTML = `
            <span class="stat-label">⏱️ Tiempo Total Estimado:</span>
            <span class="stat-value">${formatearTiempo(tiempoTotal)}</span>
        `;
        stats.appendChild(tiempoTotalItem);
    }
}

// Calcular tiempo estimado del recorrido
function calcularTiempoEstimado(distancia, cantidadPaquetes) {
    // Tiempo de desplazamiento (distancia / velocidad)
    const tiempoDesplazamiento = distancia / VELOCIDAD_MENSAJERO;
    
    // Tiempo de entrega (tiempo por paquete)
    const tiempoEntrega = cantidadPaquetes * TIEMPO_ENTREGA_PAQUETE;
    
    // Tiempo total en segundos
    const tiempoTotalSegundos = tiempoDesplazamiento + tiempoEntrega;
    
    return {
        total: tiempoTotalSegundos,
        desplazamiento: tiempoDesplazamiento,
        entrega: tiempoEntrega
    };
}

// Formatear tiempo en formato legible
function formatearTiempo(segundos) {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = Math.floor(segundos % 60);
    
    if (horas > 0) {
        return `${horas}h ${minutos}m ${segs}s`;
    } else if (minutos > 0) {
        return `${minutos}m ${segs}s`;
    } else {
        return `${segs}s`;
    }
}

// Algoritmo del Vecino Más Cercano (Greedy TSP)
function vecinoMasCercano(origen, destinos) {
    if (destinos.length === 0) return { ruta: [origen], distancia: 0 };
    
    // Eliminar duplicados y el origen si está en destinos
    const destinosUnicos = [...new Set(destinos)].filter(d => d !== origen);
    
    if (destinosUnicos.length === 0) return { ruta: [origen], distancia: 0 };
    if (destinosUnicos.length === 1) {
        const distancia = obtenerDistancia(origen, destinosUnicos[0]);
        return { ruta: [origen, destinosUnicos[0], origen], distancia: distancia * 2 };
    }

    const ruta = [origen];
    let distanciaTotal = 0;
    let actual = origen;
    const destinosRestantes = [...destinosUnicos];

    while (destinosRestantes.length > 0) {
        let masCercano = null;
        let distanciaMinima = Infinity;

        // Encontrar el destino no visitado más cercano
        for (const destino of destinosRestantes) {
            const distancia = obtenerDistancia(actual, destino);
            if (distancia < distanciaMinima) {
                distanciaMinima = distancia;
                masCercano = destino;
            }
        }

        if (masCercano) {
            ruta.push(masCercano);
            distanciaTotal += distanciaMinima;
            actual = masCercano;
            const index = destinosRestantes.indexOf(masCercano);
            destinosRestantes.splice(index, 1);
        }
    }

    // Volver al origen
    const distanciaRetorno = obtenerDistancia(actual, origen);
    ruta.push(origen);
    distanciaTotal += distanciaRetorno;

    return { ruta, distancia: distanciaTotal };
}

// Obtener distancia entre dos nodos (usando BFS para encontrar el camino más corto)
function obtenerDistancia(nodo1, nodo2) {
    if (nodo1 === nodo2) return 0;
    
    // Verificar conexión directa
    if (grafo[nodo1] && grafo[nodo1][nodo2]) {
        return grafo[nodo1][nodo2];
    }

    // BFS para encontrar el camino más corto
    const queue = [{ nodo: nodo1, distancia: 0 }];
    const visitados = new Set([nodo1]);

    while (queue.length > 0) {
        const { nodo, distancia } = queue.shift();

        if (nodo === nodo2) {
            return distancia;
        }

        if (grafo[nodo]) {
            for (const vecino in grafo[nodo]) {
                if (!visitados.has(vecino)) {
                    visitados.add(vecino);
                    queue.push({
                        nodo: vecino,
                        distancia: distancia + grafo[nodo][vecino]
                    });
                }
            }
        }
    }

    return Infinity;
}

// Simular envío del día
async function simularEnvio() {
    if (paquetes.length === 0) {
        alert('No hay paquetes para enviar');
        return;
    }

    recorridos = [];
    const origen = 'BLOQUE A';

    // Separar paquetes por prioridad
    const paquetesUrgentes = paquetes.filter(p => p.prioridad === 'urgente');
    const paquetesNormales = paquetes.filter(p => p.prioridad === 'normal');

    // Procesar paquetes urgentes (un solo recorrido para todos los urgentes)
    if (paquetesUrgentes.length > 0) {
        const destinos = paquetesUrgentes.map(p => p.destino);
        const resultado = vecinoMasCercano(origen, destinos);
        const tiempoEstimado = calcularTiempoEstimado(resultado.distancia, paquetesUrgentes.length);
        
        recorridos.push({
            tipo: 'urgente',
            ruta: resultado.ruta,
            distancia: resultado.distancia,
            paquetes: paquetesUrgentes,
            tiempoEstimado: tiempoEstimado
        });

        await animarRecorrido(resultado.ruta, 'urgente');
    }

    // Procesar paquetes normales (un solo recorrido para todos los normales)
    if (paquetesNormales.length > 0) {
        const destinos = paquetesNormales.map(p => p.destino);
        const resultado = vecinoMasCercano(origen, destinos);
        const tiempoEstimado = calcularTiempoEstimado(resultado.distancia, paquetesNormales.length);
        
        recorridos.push({
            tipo: 'normal',
            ruta: resultado.ruta,
            distancia: resultado.distancia,
            paquetes: paquetesNormales,
            tiempoEstimado: tiempoEstimado
        });

        await animarRecorrido(resultado.ruta, 'normal');
    }

    // Limpiar paquetes procesados
    paquetes = [];
    actualizarListaPaquetes();
    actualizarEstadisticas();
    mostrarRecorridos();
}

// Animar el recorrido en el mapa
async function animarRecorrido(ruta, tipo) {
    const color = tipo === 'urgente' ? '#F44336' : '#FF9800';
    const svg = document.getElementById('mapa');

    // Limpiar rutas anteriores y números de orden
    document.querySelectorAll('.ruta-activa').forEach(el => el.remove());
    document.querySelectorAll('.numero-orden').forEach(el => el.remove());

    // Dibujar la ruta completa primero
    for (let i = 0; i < ruta.length - 1; i++) {
        const nodo1 = ruta[i];
        const nodo2 = ruta[i + 1];
        const pos1 = posiciones[nodo1];
        const pos2 = posiciones[nodo2];

        // Encontrar el camino real (puede no ser directo)
        const camino = encontrarCamino(nodo1, nodo2);
        
        for (let j = 0; j < camino.length - 1; j++) {
            const p1 = posiciones[camino[j]];
            const p2 = posiciones[camino[j + 1]];

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', p1.x);
            line.setAttribute('y1', p1.y);
            line.setAttribute('x2', p2.x);
            line.setAttribute('y2', p2.y);
            line.setAttribute('stroke', color);
            line.setAttribute('stroke-width', '4');
            line.setAttribute('stroke-dasharray', '5,5');
            line.setAttribute('opacity', '0.5');
            line.setAttribute('class', 'ruta-activa');
            svg.appendChild(line);
        }
    }

    // Marcar puntos de entrega con números secuenciales
    let numeroEntrega = 1;
    for (let i = 1; i < ruta.length - 1; i++) {
        const nodo = ruta[i];
        const pos = posiciones[nodo];
        
        // Crear fondo para el número
        const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bgCircle.setAttribute('cx', pos.x);
        bgCircle.setAttribute('cy', pos.y - 45);
        bgCircle.setAttribute('r', 18);
        bgCircle.setAttribute('fill', color);
        bgCircle.setAttribute('stroke', '#fff');
        bgCircle.setAttribute('stroke-width', '3');
        bgCircle.setAttribute('class', 'numero-orden');
        bgCircle.setAttribute('style', 'filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));');
        svg.appendChild(bgCircle);
        
        // Crear el número
        const numeroText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        numeroText.setAttribute('x', pos.x);
        numeroText.setAttribute('y', pos.y - 40);
        numeroText.setAttribute('font-size', '16');
        numeroText.setAttribute('fill', '#fff');
        numeroText.setAttribute('text-anchor', 'middle');
        numeroText.setAttribute('font-weight', '700');
        numeroText.setAttribute('class', 'numero-orden');
        numeroText.textContent = numeroEntrega;
        svg.appendChild(numeroText);
        
        numeroEntrega++;
    }

    // Animación paso a paso
    for (let i = 0; i < ruta.length - 1; i++) {
        const nodo1 = ruta[i];
        const nodo2 = ruta[i + 1];
        
        // Resaltar nodo actual
        const nodoActual = document.querySelector(`.nodo.${nodo1.replace(/\s+/g, '-').toLowerCase()}`);
        if (nodoActual) {
            nodoActual.setAttribute('fill', '#FFC107');
            nodoActual.classList.add('pulse');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Dibujar línea animada
        const camino = encontrarCamino(nodo1, nodo2);
        for (let j = 0; j < camino.length - 1; j++) {
            const p1 = posiciones[camino[j]];
            const p2 = posiciones[camino[j + 1]];

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', p1.x);
            line.setAttribute('y1', p1.y);
            line.setAttribute('x2', p2.x);
            line.setAttribute('y2', p2.y);
            line.setAttribute('stroke', color);
            line.setAttribute('stroke-width', '5');
            line.setAttribute('class', 'ruta-activa');
            line.style.opacity = '0';
            svg.appendChild(line);

            // Animación de la línea
            let opacity = 0;
            const interval = setInterval(() => {
                opacity += 0.1;
                line.style.opacity = opacity;
                if (opacity >= 1) {
                    clearInterval(interval);
                }
            }, 50);
        }

        await new Promise(resolve => setTimeout(resolve, 800));

        // Restaurar color del nodo
        if (nodoActual) {
            const esOrigen = nodo1 === 'BLOQUE A';
            nodoActual.setAttribute('fill', esOrigen ? '#4CAF50' : '#2196F3');
            nodoActual.classList.remove('pulse');
        }
    }

    // Restaurar color del último nodo
    const ultimoNodo = document.querySelector(`.nodo.${ruta[ruta.length - 1].replace(/\s+/g, '-').toLowerCase()}`);
    if (ultimoNodo) {
        ultimoNodo.setAttribute('fill', '#4CAF50');
    }
}

// Encontrar el camino real entre dos nodos (BFS)
function encontrarCamino(nodo1, nodo2) {
    if (nodo1 === nodo2) return [nodo1];
    
    // Verificar conexión directa
    if (grafo[nodo1] && grafo[nodo1][nodo2]) {
        return [nodo1, nodo2];
    }

    // BFS para encontrar el camino
    const queue = [{ nodo: nodo1, camino: [nodo1] }];
    const visitados = new Set([nodo1]);

    while (queue.length > 0) {
        const { nodo, camino } = queue.shift();

        if (nodo === nodo2) {
            return camino;
        }

        if (grafo[nodo]) {
            for (const vecino in grafo[nodo]) {
                if (!visitados.has(vecino)) {
                    visitados.add(vecino);
                    queue.push({
                        nodo: vecino,
                        camino: [...camino, vecino]
                    });
                }
            }
        }
    }

    return [nodo1, nodo2];
}

// Mostrar recorridos realizados
function mostrarRecorridos() {
    const lista = document.getElementById('recorridosLista');
    lista.innerHTML = '';

    if (recorridos.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'empty-message';
        emptyMsg.textContent = 'No hay recorridos realizados';
        lista.appendChild(emptyMsg);
        return;
    }

    recorridos.forEach((recorrido, index) => {
        const item = document.createElement('div');
        item.className = 'recorrido-item';
        
        const tipoBadge = document.createElement('span');
        tipoBadge.className = `badge-${recorrido.tipo}`;
        tipoBadge.textContent = recorrido.tipo.toUpperCase();

        const header = document.createElement('div');
        header.className = 'recorrido-header';
        
        const tituloDiv = document.createElement('div');
        const titulo = document.createElement('span');
        titulo.className = 'recorrido-titulo';
        titulo.textContent = `Recorrido ${index + 1}`;
        tituloDiv.appendChild(titulo);
        tituloDiv.appendChild(tipoBadge);
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'recorrido-info';
        
        const distancia = document.createElement('div');
        distancia.className = 'recorrido-distancia';
        distancia.textContent = `${recorrido.distancia.toFixed(2)}m`;
        
        const tiempo = document.createElement('div');
        tiempo.className = 'recorrido-tiempo';
        tiempo.textContent = `⏱️ ${formatearTiempo(recorrido.tiempoEstimado.total)}`;
        
        infoDiv.appendChild(distancia);
        infoDiv.appendChild(tiempo);
        
        header.appendChild(tituloDiv);
        header.appendChild(infoDiv);

        // Contar paquetes por destino
        const paquetesPorDestino = {};
        recorrido.paquetes.forEach(paquete => {
            if (!paquetesPorDestino[paquete.destino]) {
                paquetesPorDestino[paquete.destino] = 0;
            }
            paquetesPorDestino[paquete.destino]++;
        });

        const rutaDiv = document.createElement('div');
        rutaDiv.className = 'recorrido-ruta';
        recorrido.ruta.forEach((nodo, i) => {
            const paso = document.createElement('div');
            paso.className = 'ruta-paso';
            
            const nodoSpan = document.createElement('span');
            const esOrigen = nodo === 'BLOQUE A' && (i === 0 || i === recorrido.ruta.length - 1);
            nodoSpan.className = `ruta-nodo ${esOrigen ? 'origen' : ''}`;
            
            // Mostrar cantidad de paquetes si hay múltiples en este destino
            const cantidadPaquetes = paquetesPorDestino[nodo] || 0;
            let textoNodo = nodo.replace('BLOQUE ', '');
            if (cantidadPaquetes > 0 && !esOrigen) {
                textoNodo += ` (${cantidadPaquetes})`;
            }
            nodoSpan.textContent = textoNodo;
            paso.appendChild(nodoSpan);
            
            if (i < recorrido.ruta.length - 1) {
                const flecha = document.createElement('span');
                flecha.className = 'ruta-flecha';
                flecha.textContent = '→';
                paso.appendChild(flecha);
            }
            
            rutaDiv.appendChild(paso);
        });

        // Detalle de paquetes por destino
        const paquetesDiv = document.createElement('div');
        paquetesDiv.className = 'recorrido-paquetes';
        
        const totalPaquetes = recorrido.paquetes.length;
        const destinosUnicos = Object.keys(paquetesPorDestino).length;
        
        let detallePaquetes = `<strong>Total de paquetes:</strong> ${totalPaquetes} | <strong>Destinos visitados:</strong> ${destinosUnicos}<br>`;
        detallePaquetes += `<strong>Tiempo estimado:</strong> ${formatearTiempo(recorrido.tiempoEstimado.total)} `;
        detallePaquetes += `(Desplazamiento: ${formatearTiempo(recorrido.tiempoEstimado.desplazamiento)}, `;
        detallePaquetes += `Entrega: ${formatearTiempo(recorrido.tiempoEstimado.entrega)})<br>`;
        detallePaquetes += '<strong>Detalle por destino:</strong><ul class="paquetes-detalle">';
        
        Object.keys(paquetesPorDestino).sort().forEach(destino => {
            const cantidad = paquetesPorDestino[destino];
            const textoDestino = destino.replace('BLOQUE ', '');
            detallePaquetes += `<li>${textoDestino}: ${cantidad} paquete${cantidad > 1 ? 's' : ''}</li>`;
        });
        
        detallePaquetes += '</ul>';
        paquetesDiv.innerHTML = detallePaquetes;

        item.appendChild(header);
        item.appendChild(rutaDiv);
        item.appendChild(paquetesDiv);
        lista.appendChild(item);
    });
}

// Limpiar todo
function limpiarTodo() {
    paquetes = [];
    recorridos = [];
    actualizarListaPaquetes();
    actualizarEstadisticas();
    mostrarRecorridos();
    
    // Limpiar mapa (rutas y números de orden)
    document.querySelectorAll('.ruta-activa').forEach(el => el.remove());
    document.querySelectorAll('.numero-orden').forEach(el => el.remove());
    dibujarMapa();
}

