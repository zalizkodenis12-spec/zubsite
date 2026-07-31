import CanvasSequence from "@/components/CanvasSequence";

export default function Home() {
  return (
    // 300vh робить прокрутку значно швидшою (коротшою).
    // The CanvasSequence component is sticky and will remain in viewport.
    <main className="relative w-full h-[300dvh] bg-black">
      <CanvasSequence 
        frameCount={120} 
        imagePathPrefix="/images/ezgif-frame-" 
        imagePathSuffix=".jpg" 
      />
    </main>
  );
}
