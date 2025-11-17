# DevCalc: Calculadoras de Programación

![Licencia](https://img.shields.io/badge/license-GPLv3-blue.svg)

**DevCalc** es una colección de calculadoras y herramientas para desarrolladores, diseñada para ser rápida, intuitiva y estéticamente agradable. Incluye utilidades esenciales como conversores de bases numéricas, formateadores de JSON, generadores de hash y mucho más.

[Ver Demo en Vivo](https://devcalc.vercel.app/) (Enlace de ejemplo)

---

## ✨ Características

-   **Interfaz Moderna y Responsiva**: Un diseño limpio y adaptable a cualquier dispositivo, con modo claro y oscuro.
-   **Rendimiento**: Construido con tecnologías modernas para una experiencia de usuario fluida y sin recargas de página.
-   **Cero Dependencias Externas en Producción**: La aplicación es un único bundle de JavaScript, optimizado para una carga rápida.

### Herramientas Incluidas

*   ✅ **Conversor de Bases:** Convierte entre texto (UTF-8), Base64, Hexadecimal (bytes), y representaciones numéricas (decimal, binario, hexadecimal). Incluye un conversor de unidades de almacenamiento (Bytes, KB, MB, GB, etc.).
*   ✅ **Conversor de Tiempo:** Realiza conversiones entre diversas unidades de tiempo, desde nanosegundos hasta siglos.
*   ✅ **Tiempo Unix:** Convierte timestamps de Unix a fechas legibles (GMT y local) y viceversa. Permite seleccionar fechas y obtener el timestamp correspondiente.
*   ✅ **Codificador URL:** Codifica y decodifica texto para que sea seguro de usar en URLs (`encodeURIComponent` / `decodeURIComponent`).
*   ✅ **Formateador JSON:** Valida, formatea (pretty-print) y minifica datos JSON. Muestra errores detallados con número de línea y columna.
*   ✅ **Generador de Hash:** Calcula hashes (MD5, SHA-1, SHA-26, SHA-512) para entradas de texto o archivos locales de forma segura en el navegador.
*   ✅ **Generador UUID:** Crea identificadores únicos universales (UUIDs) en sus versiones v1 (basado en tiempo) y v4 (aleatorio).

## 🛠️ Stack Tecnológico

-   **Frontend:** [React](https://react.dev/) y [TypeScript](https://www.typescriptlang.org/)
-   **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
-   **Build Tool:** [esbuild](https://esbuild.github.io/) (para un empaquetado ultra rápido)

---

## 🚀 Puesta en Marcha (Desarrollo Local)

Sigue estos pasos para configurar y ejecutar el proyecto en tu máquina local.

### Prerrequisitos

-   [Node.js](https://nodejs.org/) (versión 18 o superior)
-   [npm](https://www.npmjs.com/) o un gestor de paquetes compatible (yarn, pnpm)

### Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/TU_USUARIO/devcalc.git
    cd devcalc
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

### Ejecutar el Servidor de Desarrollo

Para iniciar el servidor de desarrollo con recarga en vivo, ejecuta:

```bash
npm run dev
```

Esto iniciará un servidor local (generalmente en `http://127.0.0.1:8000`) y abrirá la aplicación en tu navegador. `esbuild` recompilará automáticamente los archivos cuando detecte cambios.

## 📦 Proceso de Build

Para crear una versión optimizada para producción, utiliza el siguiente comando:

```bash
npm run build
```

Este comando utiliza `esbuild` para transpilar el código TypeScript/JSX, empaquetarlo en un único archivo JavaScript (`public/dist/bundle.js`) y minificarlo para obtener el mejor rendimiento.

El resultado es un conjunto de archivos estáticos en el directorio `public` que se pueden desplegar en cualquier servicio de hosting.

---

## 🌐 Despliegue

DevCalc está diseñado para ser desplegado fácilmente como un sitio estático.

### Vercel (Recomendado)

1.  Haz un fork de este repositorio en tu cuenta de GitHub.
2.  Ve a tu [Dashboard de Vercel](https://vercel.com/dashboard) y haz clic en "Add New... -> Project".
3.  Importa el repositorio que acabas de "forkear".
4.  Vercel detectará la configuración del proyecto y la compilará automáticamente. Con los cambios recientes, no deberías necesitar cambiar ninguna configuración.
5.  Haz clic en "Deploy". ¡Y listo! Tu aplicación estará en línea en segundos.

### Alternativas

#### Netlify

El proceso es muy similar a Vercel. Puedes conectar tu repositorio de GitHub y Netlify se encargará del resto.
-   **Build Command:** `npm run build`
-   **Publish directory:** `public`

#### Hosting Estático (GitHub Pages, AWS S3, etc.)

1.  Ejecuta el comando `npm run build` localmente.
2.  Sube el contenido del directorio `public` a tu proveedor de hosting.

Asegúrate de que tu servidor esté configurado para servir `index.html` como la página de entrada.

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si tienes ideas para nuevas herramientas, mejoras de rendimiento o correcciones de errores, por favor:

1.  Haz un "Fork" del proyecto.
2.  Crea una nueva rama (`git checkout -b feature/nueva-herramienta`).
3.  Realiza tus cambios y haz "Commit" (`git commit -m 'Añade nueva-herramienta'`).
4.  Haz "Push" a tu rama (`git push origin feature/nueva-herramienta`).
5.  Abre un "Pull Request".

## 📜 Licencia

Este proyecto está bajo la Licencia Pública General de GNU v3.0. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---
Creado con ❤️ y mucho ☕ por [ANONIMO432HZ](https://github.com/ANONIMO432HZ)