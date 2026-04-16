# Ascii Era

Ascii Era is a lightweight, responsive Next.js application that captures your live webcam feed and instantly converts it to highly customizable ASCII art directly in your browser. 

Built with performance in mind via the `HTML5 Canvas` API and `requestAnimationFrame`, the app guarantees buttery smooth render speeds with zero reliance on backend servers.

## Features

- **Live Generation**: Streams camera via `getUserMedia` directly to an off-screen HTML5 video and parses it locally without making network calls.
- **Customizable Modes**:
  - `Matrix`: The iconic hacker green text on black.
  - `BW`: High contrast white on black.
  - `Retro`: Vintage amber/orange terminal colors.
  - `Color`: Attempts to faithfully replicate your input pixel color via `rgb()` matching.
- **Variable Charsets**: Toggle between Simple, Complex, Binary, and Density Block modes.
- **Video Adjustments**: Fine-tune the rendering with responsive `Gain` and `Contrast`, or increase the `Font Size` slider to scale pixel density on the fly.
- **Snapshot Support**: One-click download utility that dumps your current Canvas straight to an `.png` image.
- **Mobile Responsive**: Controls smartly shrink down to a hidden drawer bottom-sheet on mobile breakpoints, accessible via a cog toggle, freeing up your screen.

## Getting Started

1. Clone or download this repository locally:
   ```bash
   git clone https://github.com/i-am-sky/ascii-era.git
   ```
2. Navigate to the project directory and install the required Next.js dependencies:
   ```bash
   cd ascii-era
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
   > **Note:** Be sure to securely allow browser Camera access when prompted.

## Tech Stack
- React 18 / Next.js
- Tailwind-free Vanilla CSS
- `lucide-react` for scalable SVGs

## License
MIT License
