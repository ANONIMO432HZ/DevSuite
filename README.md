# DevSuite: Herramientas Digitales Integrales

![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-cyan.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)

**DevSuite** es una "navaja suiza" digital para desarrolladores y creativos. Una aplicación web progresiva (PWA) que reúne herramientas de conversión, criptografía, diseño y manipulación de datos en una interfaz moderna, rápida y capaz de funcionar sin conexión.

Visite [DevSuite](https://devsuite-flame.vercel.app/) no necesita login y es 100% Freemium.

---

## 🚀 Características Principales

### 📱 Progressive Web App (PWA)
DevSuite es instalable. Puedes añadirla a tu pantalla de inicio en móvil o escritorio y usarla **100% Offline**. No requiere internet para realizar cálculos o conversiones una vez cargada.

### 📜 Historial de Cálculos
Nunca pierdas un resultado. DevSuite incluye un panel lateral de historial persistente que guarda tus conversiones, hashes y paletas generadas automáticamente o bajo demanda.

### 🎨 Diseño y UX
-   **Tema Oscuro/Claro**: Detección automática y cambio manual.
-   **Interfaz Reactiva**: Cálculos en tiempo real mientras escribes.
-   **Dashboard**: Pantalla de bienvenida con acceso rápido a todas las herramientas.

---

## 🛠️ Herramientas Incluidas

### 1. Conversor Universal
Unificación de conversores físicos y temporales.
-   **Categorías:** Longitud, Masa/Peso, Volumen, Área, Velocidad y Tiempo.
-   **Reactividad:** Convierte entre todas las unidades simultáneamente (ej. escribe en Metros, obten Pies, Pulgadas y Millas al instante).
-   **Precisión:** Manejo de notación científica para valores muy grandes o pequeños.

### 2. Conversor de Datos (JSON/YAML/TOML)
-   **Formatos:** Conversión bidireccional entre JSON, YAML y TOML.
-   **Editor:** Validación de sintaxis en tiempo real.
-   **Utilidades:** Minificado, embellecido (Pretty Print), descodificación de strings JSON escapados.
-   **Archivos:** Importación y exportación de archivos `.json`, `.yaml`, `.toml`.

### 3. Lógica Bitwise
Visualizador de operaciones a nivel de bits para programación de bajo nivel.
-   **Operaciones:** AND, OR, XOR, NOT, NAND, NOR, XNOR, Shifts (<<, >>, >>>).
-   **Visualización:** Representación binaria de 32 bits desglosada en nibbles.
-   **Entrada:** Soporta Decimal, Hexadecimal (`0x`) y Binario (`0b`).

### 4. Paletas y Colores
Suite de diseño para crear esquemas de color.
-   **Generador:** Armonías (Análoga, Monocromática, Complementaria, Triada, etc.).
-   **Edición:** Sliders visuales RGB y HSL.
-   **Psicología:** Presets de color basados en emociones (Confianza, Energía, Lujo...).
-   **Gradientes:** Generador de código CSS para degradados lineales y radiales.
-   **Exportación:** Copia como Variables CSS o JSON.

### 5. Conversor de Bases Numéricas
-   **Formatos:** Decimal, Binario, Hexadecimal.
-   **Texto/Bytes:** Conversión de Texto UTF-8 a Hex Bytes, Base64 y ASCII.
-   **Unidades Digitales:** Conversor de Bytes a KB, MB, GB, TB, PB.

### 6. Criptografía (Hash)
-   **Algoritmos:** MD5, SHA-1, SHA-256, SHA-512.
-   **Archivos:** Generación de hash para archivos locales (hasta 200MB) sin subirlos a ningún servidor.
-   **Seguridad:** Uso de la Web Crypto API nativa del navegador.

### 7. Utilidades Varias
-   **Tiempo Unix:** Timestamp actual, conversor de fechas Local/GMT y fechas relativas.
-   **UUID:** Generador de UUID v4 (Aleatorio) y v1 (Tiempo).
-   **URL Encoder:** Codificación y decodificación segura de URIs.

---

## 💻 Stack Tecnológico

-   **Frontend:** [React 18](https://react.dev/)
-   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
-   **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
-   **Empaquetado:** [Esbuild](https://esbuild.github.io/)
-   **Parsers:** `js-yaml`, `smol-toml`, `crypto-js`.

---

## ⚙️ Instalación Local

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/ANONIMO432HZ/devsuite.git
    cd devsuite
    ```

2.  **Instala dependencias:**
    ```bash
    npm install
    ```

3.  **Inicia en modo desarrollo:**
    ```bash
    npm run dev
    ```
    Abre `http://127.0.0.1:8000` en tu navegador.

4.  **Construir para Producción:**
    ```bash
    npm run build
    ```
    Esto generará una carpeta `public/` con todos los archivos estáticos, iconos y el Service Worker listos para desplegar.

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas!
1.  Haz un Fork.
2.  Crea tu rama (`git checkout -b feature/amazing-feature`).
3.  Haz Commit (`git commit -m 'Add some amazing feature'`).
4.  Haz Push (`git push origin feature/amazing-feature`).
5.  Abre un Pull Request.

---

**Creado por [4N0N1M0](https://github.com/ANONIMO432HZ)**
