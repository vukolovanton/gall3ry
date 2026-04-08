import { InfiniteGallery } from "../../src/index.ts";

// Import your images (Vite handles this)
import img01 from "./assets/img01.webp";
import img02 from "./assets/img02.webp";
import img03 from "./assets/img03.webp";
import img04 from "./assets/img04.webp";
import img05 from "./assets/img05.webp";
import img06 from "./assets/img06.webp";
import img07 from "./assets/img07.webp";
import img08 from "./assets/img08.webp";
import img09 from "./assets/img09.webp";

async function runApplication() {
  // 1. Create the instance
  const gallery = new InfiniteGallery({
    containerId: "cards", // Matches the <section id="cards">
    images: [img01, img02, img03, img04, img05, img06, img07, img08, img09],
    options: {
      friction: 0.9,
      maxRotation: 28,
      gap: 28, // Distance between cards
    },
  });

  // 2. Setup Listeners
  gallery.on("ready", () => {
    console.log("✅ Gallery is fully initialized and animated in!");
  });

  gallery.on("cardChange", (data: { index: number; direction: string }) => {
    console.log(
      `🖼️ Active image changed to Index: ${data.index} (Direction: ${data.direction})`,
    );
  });

  gallery.on("scrollStart", () => {
    console.log("👆 User started interacting");
  });

  // 3. Initialize it
  try {
    await gallery.initialize();
  } catch (err) {
    console.error("Failed to start gallery:", err);
  }

  // 4. Test the API Methods (Wiring up the UI buttons)
  document.getElementById("btn-next")?.addEventListener("click", () => {
    // Scroll to index 2 (the 3rd image), true = animate smoothly
    gallery.scrollTo(2, true);
  });

  document.getElementById("btn-stop")?.addEventListener("click", () => {
    gallery.stop();
    console.log("Gallery paused.", gallery.getState());
  });

  document.getElementById("btn-start")?.addEventListener("click", () => {
    gallery.start();
    console.log("Gallery resumed.");
  });
}

runApplication();
