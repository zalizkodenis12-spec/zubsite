import CanvasSequence from "@/components/CanvasSequence";

export default function Home() {
  return (
    // 800vh ensures a long and cinematic scroll distance. 
    // The CanvasSequence component is sticky and will remain in viewport.
    <main className="relative w-full h-[800vh] bg-black">
      <CanvasSequence 
        frameCount={120} 
        imagePathPrefix="/images/ezgif-frame-" 
        imagePathSuffix=".jpg" 
      />
    </main>
  );
}
