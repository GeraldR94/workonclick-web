/**
 * Router de Geolocalización por IP — v2
 * Archivo: js/geoloc.js
 *
 * Solo redirige desde index.html → index-ar.html si el usuario es de Argentina.
 * El resto del mundo se queda en index.html (versión US/Internacional).
 *
 * Claves de almacenamiento:
 *   - woc_country_manual  (localStorage)  → preferencia fijada manualmente por el usuario
 *   - woc_country_auto    (sessionStorage) → detección automática por IP (se resetea al cerrar navegador)
 */
(function () {
    // 1. Bypass SEO: No redirigir rastreadores de motores de búsqueda (Googlebot, Bingbot, etc.)
    if (/bot|googlebot|bingbot|duckduckbot|slurp|baiduspider|yandex|chrome-lighthouse|ptst/i.test(navigator.userAgent)) {
        return;
    }

    // Guard: evitar ejecuciones duplicadas o simultáneas
    if (window.__geoRedirecting) return;

    var COUNTRY_ROUTES = {
        AR: 'index-ar.html',
        US: 'index-us.html'
    };
    var API_TIMEOUT_MS = 3000;

    // Obtener solo el nombre del archivo actual (sin ruta ni query params)
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Si ya estamos en una landing específica de país, no hacer nada
    var targetPages = Object.values(COUNTRY_ROUTES);
    for (var i = 0; i < targetPages.length; i++) {
        if (currentPage === targetPages[i]) return;
    }

    // Solo ejecutar en index.html (la landing por defecto)
    if (currentPage !== 'index.html' && currentPage !== '') return;

    // ── Prioridad 1: Preferencia MANUAL del usuario (permanente) ──
    var manualPref = localStorage.getItem('woc_country_manual');
    if (manualPref) {
        if (COUNTRY_ROUTES[manualPref]) {
            doRedirect(COUNTRY_ROUTES[manualPref]);
        }
        // Si la preferencia manual es US o no mapeada, quedarse en index.html
        return;
    }

    // ── Prioridad 2: Detección automática de SESIÓN (temporal) ──
    var sessionCountry = sessionStorage.getItem('woc_country_auto');
    if (sessionCountry) {
        if (COUNTRY_ROUTES[sessionCountry]) {
            doRedirect(COUNTRY_ROUTES[sessionCountry]);
        }
        return;
    }

    // ── Prioridad 3: Consultar API con timeout y fallback ──
    window.__geoRedirecting = true;
    var controller = new AbortController();
    var timeoutId = setTimeout(function () { controller.abort(); }, API_TIMEOUT_MS);

    fetch('https://ipapi.co/json/', { signal: controller.signal })
        .then(function (res) {
            if (!res.ok) throw new Error('API response ' + res.status);
            return res.json();
        })
        .catch(function () {
            // Fallback: segunda API en caso de que ipapi.co falle o sea bloqueada
            return fetch('https://api.country.is/')
                .then(function (res) { return res.json(); });
        })
        .then(function (data) {
            clearTimeout(timeoutId);
            var country = data.country_code || data.country || 'US';
            sessionStorage.setItem('woc_country_auto', country);

            if (COUNTRY_ROUTES[country]) {
                doRedirect(COUNTRY_ROUTES[country]);
            }
            // Si no hay ruta mapeada, se queda en index.html (US/Internacional)
        })
        .catch(function (err) {
            clearTimeout(timeoutId);
            console.warn('[WOC GeoRouter] Detección fallida:', err);
            sessionStorage.setItem('woc_country_auto', 'US');
            // Se queda en index.html — no redirige
        })
        .finally(function () {
            window.__geoRedirecting = false;
        });

    /**
     * Ejecuta la redirección a la página especificada.
     * @param {string} page — nombre del archivo destino (ej: 'index-ar.html')
     */
    function doRedirect(page) {
        window.__geoRedirecting = true;
        window.location.href = page;
    }
})();
