import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Loader2, Mail, User, Calendar } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AnimatedSection } from '@/components/AnimatedSection';

type ReadingType = 'full' | 'career' | 'love' | 'wealth';

interface FormData {
  name: string;
  age: string;
  email: string;
  readingType: ReadingType;
}

export default function UploadPalm() {
  const navigate = useNavigate();
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    email: '',
    readingType: 'full',
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  }, []);

  const processImage = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!image || !formData.name || !formData.email || !formData.age) {
      return;
    }

    setIsLoading(true);
    
    // Store form data in sessionStorage for the report page
    sessionStorage.setItem('palmMitraData', JSON.stringify({
      ...formData,
      palmImage: image,
    }));

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    navigate('/report');
  };

  const isFormValid = image && formData.name && formData.email && formData.age;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
              Upload Your <span className="text-gradient-gold">Palm</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Share a clear photo of your palm and let our AI reveal your destiny
            </p>
          </AnimatedSection>

          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Upload Area */}
              <AnimatedSection delay={0.1}>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative rounded-3xl border-2 border-dashed transition-all duration-300 overflow-hidden ${
                    isDragging
                      ? 'border-accent bg-accent/5 scale-[1.02]'
                      : image
                      ? 'border-accent/50'
                      : 'border-border hover:border-accent/50 pulse-border'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {image ? (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative aspect-square max-h-96 mx-auto"
                      >
                        <img
                          src={image}
                          alt="Palm preview"
                          className="w-full h-full object-cover rounded-3xl"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-4 left-4 right-4 bg-card/90 backdrop-blur-sm rounded-xl p-3 text-center">
                          <p className="text-sm font-medium text-foreground">
                            ✓ Palm image uploaded successfully
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.label
                        key="upload"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center p-12 cursor-pointer"
                      >
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mb-6"
                        >
                          <Upload className="w-10 h-10 text-accent" />
                        </motion.div>
                        <h3 className="text-xl font-serif font-bold text-foreground mb-2">
                          Drag & Drop Your Palm Photo
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          or click to browse from your device
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Supports: JPG, PNG, WEBP (Max 10MB)
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </motion.label>
                    )}
                  </AnimatePresence>
                </div>
              </AnimatedSection>

              {/* Form Fields */}
              <AnimatedSection delay={0.2} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      Your Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="rounded-xl py-6 bg-card border-border focus:border-accent"
                    />
                  </div>

                  {/* Age */}
                  <div className="space-y-2">
                    <Label htmlFor="age" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      Your Age
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      min="1"
                      max="120"
                      placeholder="Enter your age"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="rounded-xl py-6 bg-card border-border focus:border-accent"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email to receive your report"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="rounded-xl py-6 bg-card border-border focus:border-accent"
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll send your detailed report to this email
                  </p>
                </div>

                {/* Reading Type */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Reading Type
                  </Label>
                  <Select
                    value={formData.readingType}
                    onValueChange={(value: ReadingType) => 
                      setFormData({ ...formData, readingType: value })
                    }
                  >
                    <SelectTrigger className="rounded-xl py-6 bg-card border-border">
                      <SelectValue placeholder="Select reading type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Life Reading (Recommended)</SelectItem>
                      <SelectItem value="career">Career Focus</SelectItem>
                      <SelectItem value="love">Love & Relationships</SelectItem>
                      <SelectItem value="wealth">Wealth & Prosperity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </AnimatedSection>

              {/* Submit Button */}
              <AnimatedSection delay={0.3}>
                <Button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className="w-full btn-gold text-foreground font-semibold text-lg py-7 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Your Reading...
                    </span>
                  ) : (
                    'Generate My Palm Reading'
                  )}
                </Button>
              </AnimatedSection>
            </form>
          </div>
        </div>
      </main>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center"
          >
            <div className="text-center">
              {/* Chakra Animation */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="w-32 h-32 mx-auto mb-8 relative"
              >
                <div className="absolute inset-0 rounded-full border-4 border-accent/30" />
                <div className="absolute inset-2 rounded-full border-2 border-accent/50" />
                <div className="absolute inset-4 rounded-full border border-accent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl">🖐️</span>
                </div>
              </motion.div>

              <motion.h2
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-2xl font-serif font-bold text-foreground mb-2"
              >
                AI Reading Your Palm...
              </motion.h2>
              <p className="text-muted-foreground">
                Analyzing your unique palm lines and patterns
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
