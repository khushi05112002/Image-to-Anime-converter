import { useState, useCallback } from "react";
import { Upload, Download, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageUploadZone from "@/components/ImageUploadZone";
import ImageComparison from "@/components/ImageComparison";
import { compressImage } from "@/utils/imageCompression";

const Index = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [animeImage, setAnimeImage] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      // Compress image before displaying
      const compressedImage = await compressImage(file, 800);
      setOriginalImage(compressedImage);
      setAnimeImage(null);
    } catch (error) {
      console.error('Compression error:', error);
      toast.error("Failed to process image");
    }
  }, []);

  const convertToAnime = async () => {
    if (!originalImage) {
      toast.error("Please upload an image first");
      return;
    }

    setIsConverting(true);
    try {
      console.log("Starting anime conversion...");
      
      const { data, error } = await supabase.functions.invoke('anime-convert', {
        body: { imageUrl: originalImage }
      });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.animeImageUrl) {
        throw new Error('No anime image received');
      }

      console.log("Conversion successful!");
      setAnimeImage(data.animeImageUrl);
      toast.success("✨ Anime conversion complete!");
      
    } catch (error: any) {
      console.error('Conversion error:', error);
      toast.error(error.message || "Failed to convert image. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  const downloadImage = () => {
    if (!animeImage) return;
    
    const link = document.createElement('a');
    link.href = animeImage;
    link.download = 'anime-style-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded!");
  };

  const reset = () => {
    setOriginalImage(null);
    setAnimeImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12 animate-in fade-in slide-in-from-top duration-700">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full border border-primary/20">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">AI-Powered Transformation</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Anime Style Converter
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform any photo into stunning anime artwork with AI magic ✨
          </p>
        </header>

        {/* Main Content */}
        <div className="space-y-8">
          {!originalImage ? (
            <Card className="p-8 md:p-12 bg-card/50 backdrop-blur border-primary/20 shadow-2xl animate-in fade-in slide-in-from-bottom duration-700">
              <ImageUploadZone onImageUpload={handleImageUpload} />
            </Card>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
              <ImageComparison 
                originalImage={originalImage}
                animeImage={animeImage}
              />
              
              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                {!animeImage ? (
                  <Button
                    size="lg"
                    onClick={convertToAnime}
                    disabled={isConverting}
                    className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    {isConverting ? (
                      <>
                        <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                        Converting to Anime...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Convert to Anime Style
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      onClick={downloadImage}
                      className="bg-gradient-to-r from-accent to-primary text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Anime Image
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={reset}
                      className="px-8 py-6 text-lg font-semibold border-2 hover:scale-105 transition-all duration-300"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Upload New Image
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom duration-1000">
          {[
            { icon: Sparkles, title: "AI-Powered", desc: "Advanced AI transforms your photos" },
            { icon: ArrowRight, title: "Instant Results", desc: "Get anime art in seconds" },
            { icon: Download, title: "High Quality", desc: "Download full resolution images" }
          ].map((feature, i) => (
            <Card key={i} className="p-6 bg-card/30 backdrop-blur border-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-105">
              <feature.icon className="w-10 h-10 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
