import NeuralNetworkBackground from '@/components/backgrounds/NeuralNetworkBackground';

const Index = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Gradient background layer */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at top right, hsl(263 70% 50% / 0.08), transparent 50%),
            radial-gradient(ellipse at bottom left, hsl(189 94% 43% / 0.08), transparent 50%),
            radial-gradient(ellipse at center, hsl(330 81% 60% / 0.05), transparent 60%)
          `
        }}
      />
      
      {/* Animated neural network */}
      <NeuralNetworkBackground />
      
      {/* Content */}
      <div className="relative z-10 text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">Welcome to Your Blank App</h1>
        <p className="text-xl text-muted-foreground">Start building your amazing project here!</p>
      </div>
    </div>
  );
};

export default Index;
