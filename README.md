# guz-vinueza.github.io

Personal website of Guz Vinueza — Executive Leadership, Data, AI & Risk Management.

# Gustavo Vinueza — sitio personal

Primera versión en español, en HTML, CSS y JavaScript sin dependencias.

Abra index.html directamente en su navegador. Todas las páginas funcionan como archivos locales; no necesitan instalación ni compilación. El tema se guarda en el navegador cuando está disponible el almacenamiento local.

## Contenido pendiente
- Biografía y fotografía aprobadas.
- Publicaciones reales y archivos con permiso de descarga.
- Enlaces individuales de videos. El canal de YouTube queda pendiente de actualización.
- Alcance de los servicios y contacto de Ferryfield Group.

Enlace facilitado por el usuario para Ferryfield Group: https://www.ferryfieldgroup.com.

No se han inventado publicaciones, credenciales, videos ni datos de contacto. Conversaciones es una sección editorial; no incluye chatbot ni envío de mensajes. La búsqueda y los filtros muestran el estado de una biblioteca aún vacía.

## Añadir videos, charlas y webinars

Edita únicamente `videos-data.js`. Cada entrada contiene:

```js
{
  titulo: 'Título real del video',
  url: 'https://youtu.be/ID_DEL_VIDEO',
  tema: 'Analítica de datos',
  coleccion: 'videos'
}
```

Separa las entradas con comas dentro de `window.VIDEOS = [ ... ];`.
Para mostrar una grabación en la página de charlas, usa `coleccion: 'charlas'` y, opcionalmente, `fecha: '2026-11-18'` y `organizador: 'Nombre de la entidad'`.
Los títulos se escriben en esta lista; no se consultan automáticamente. Hay búsqueda y se muestran 12 entradas a la vez. Los reproductores se cargan al pulsar la miniatura. Si YouTube restringe la reproducción integrada, usa «Ver en YouTube».

Funciona abriendo el HTML directamente y en GitHub Pages. Sube todos los archivos a la misma carpeta del repositorio y configura Pages para publicar esa carpeta. No hay compilación ni claves API.

Los botones de contacto usan `mailto:gvinueza@gmail.com`: abren el correo del visitante, quien debe enviar el mensaje. No son un formulario de envío automático.

## Idiomas y libros

El sitio tiene ocho páginas en español y sus equivalentes `*-en.html` en inglés. El selector EN/ES lleva a la misma sección en el otro idioma. Ambos idiomas comparten estilos, tema y lista de videos. Los títulos originales de los videos se conservan.

`libros.html` / `libros-en.html` incluyen los dos libros facilitados por el usuario y sus enlaces originales de Amazon. Los paneles tipográficos son elementos del diseño, no reproducciones de las portadas oficiales. Para añadir libros, edita las tarjetas de ambas páginas o actualiza la página española y el diccionario del generador inglés.

Después de editar los textos españoles, actualiza también sus equivalentes ingleses. El archivo auxiliar `build-english.py` genera las páginas inglesas utilizando su diccionario de traducciones; si introduces textos nuevos, añade primero la traducción al diccionario. No hace falta Python para abrir ni alojar el sitio.


## Estructura híbrida

La navegación principal reúne Perfil ejecutivo (`perfil.html`), Publicaciones, Charlas y Consultoría. La portada presenta las cuatro áreas. Publicaciones destaca los dos libros reales y conserva la biblioteca de documentos; Charlas presenta temas e invitación a eventos; Consultoría conserva el vínculo de Ferryfield Group. Libros, videos y conversaciones siguen disponibles desde el pie de página. Todas las secciones tienen equivalentes en inglés.

## Importar videos de Ferryfield

Se revisaron 74 videos del canal el 18 de noviembre de 2026 y se encontraron 40 con crédito explícito a Guz/Gustavo Vinueza en el título o la descripción. La lista comparte esos 40 videos entre ambos idiomas. `youtube-import-report.json` registra las coincidencias y exclusiones sin copiar las descripciones completas.

Para repetir la importación:

```powershell
python -m pip install yt-dlp
python scripts/sync-youtube.py
```

El importador actualiza `videos-data.js`, evita duplicados y conserva entradas anteriores y grabaciones de charlas. Si falla la lectura de metadatos, no reemplaza la lista. Después revisa los cambios y súbelos a GitHub. Es una herramienta de actualización bajo demanda; no se ejecuta periódicamente ni desde el navegador del visitante.

No se incluyeron estos cinco videos sin crédito de presentador en los metadatos consultados (pueden añadirse manualmente si confirmas tu participación):
- Introduction to ModelRisk - Insurance Demo (`6NHOGQxYTBI`)
- ModelRisk in the Oil & Gas industry (`5JatZFmgD-8`)
- Introducing ModelRisk - Cost Estimation Model (`fzGq6e_jO6U`)
- Moving from @RISK to ModelRisk - Basic Steps (`SndaJerhALA`)
- Why switching from @RISK to ModelRisk is the smartest move (`zgufFwvZlfw`)
