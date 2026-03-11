import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import palmIconGold from '@/assets/palm-icon-gold.png';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Loader2, Mail, User, Calendar, AlertCircle, CheckCircle, Hand, Camera, Sun, Eye, Shield, Lock, Sparkles, FileText, Heart, Briefcase, TrendingUp, Star } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type ReadingType = 'full' | 'career' | 'love' | 'wealth';

type ProcessingStep = 'idle' | 'uploading' | 'validating' | 'analyzing' | 'saving' | 'complete' | 'error';

interface FormData {
  name: string;
  age: string;
  email: string;
  readingType: ReadingType;
}

interface ValidationError {
  reason: string;
  suggestions: string[];
}

const mysticalLoadingMessages = [
  { step: 'uploading', messages: ['Uploading to PalmMitra Vault...', 'Securing your image...'] },
  { step: 'validating', messages: ['AI verifying palm clarity...', 'Checking line visibility...'] },
  { step: 'analyzing', messages: [
    'Reading your palm lines...',
    'Decoding your destiny...',
    'Analyzing life path...',
    'Predicting future cycles...',
    'Channeling ancient wisdom...',
  ]},
  { step: 'saving', messages: ['Preparing your destiny report...'] },
];

export default function UploadPalm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const [validationError, setValidationError] = useState<ValidationError | null>(null);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
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
    setValidationError(null);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      processImage(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG or PNG image only.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setValidationError(null);
    if (file) {
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        processImage(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG or PNG image only.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

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
    setValidationError(null);
  };

  const uploadToStorage = async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${file.type.split('/')[1]}`;
    
    const { data, error } = await supabase.storage
      .from('palm-uploads')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw new Error('Failed to upload image to storage');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('palm-uploads')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile || !formData.name || !formData.email || !formData.age) {
      return;
    }

    setValidationError(null);
    setLoadingMessageIdx(0);
    
    // Start cycling mystical messages during analyzing phase
    const messageInterval = setInterval(() => {
      setLoadingMessageIdx((prev) => prev + 1);
    }, 2200);
    
    try {
      setProcessingStep('uploading');
      const imageUrl = await uploadToStorage(imageFile);
      console.log('Image uploaded:', imageUrl);

      setProcessingStep('validating');
      
      setProcessingStep('analyzing');
      
      const { data: response, error: functionError } = await supabase.functions.invoke('analyze-palm', {
        body: {
          imageUrl,
          name: formData.name,
          age: formData.age,
          email: formData.email,
          readingType: formData.readingType,
        },
      });

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message || 'Failed to analyze palm');
      }

      if (!response.validated) {
        setProcessingStep('error');
        setValidationError({
          reason: response.message || response.validation?.reason || 'This does not appear to be a palm image.',
          suggestions: [
            'Use an open palm facing the camera',
            'Ensure good lighting on the palm',
            'Avoid blurry or unclear images',
            'Show only one hand, not both',
            'Make sure palm lines are visible'
          ]
        });
        clearInterval(messageInterval);
        return;
      }

      setProcessingStep('saving');
      
      sessionStorage.setItem('palmMitraData', JSON.stringify({
        ...formData,
        imageUrl,
        reportId: response.reportId,
        reading: response.reading,
        validation: response.validation,
        generatedAt: response.generatedAt,
      }));

      setProcessingStep('complete');
      clearInterval(messageInterval);
      
      setTimeout(() => {
        const reportPath = response.reportId ? `/report/${response.reportId}` : '/report';
        navigate(reportPath);
      }, 500);

    } catch (err) {
      console.error('Error:', err);
      setProcessingStep('error');
      clearInterval(messageInterval);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
        variant: "destructive",
      });
    }
  };

  const isFormValid = image && formData.name && formData.email && formData.age;
  const isLoading = processingStep !== 'idle' && processingStep !== 'error' && processingStep !== 'complete';

  const getStepLabel = (step: ProcessingStep) => {
    if (step === 'analyzing') {
      const msgs = mysticalLoadingMessages.find(m => m.step === 'analyzing')!.messages;
      return msgs[loadingMessageIdx % msgs.length];
    }
    switch (step) {
      case 'uploading': return 'Uploading to PalmMitra Vault...';
      case 'validating': return 'AI Checking Palm Quality...';
      case 'saving': return 'Preparing Your Destiny Report...';
      case 'complete': return 'Report Ready!';
      default: return '';
    }
  };

  // Report preview sections
  const reportPreviewSections = [
    { icon: Star, label: 'Personality Profile', color: 'text-orange-400' },
    { icon: Briefcase, label: 'Career & Wealth Path', color: 'text-blue-400' },
    { icon: TrendingUp, label: 'Money & Prosperity', color: 'text-green-400' },
    { icon: Heart, label: 'Love & Marriage', color: 'text-pink-400' },
    { icon: Shield, label: 'Health & Vitality', color: 'text-emerald-400' },
    { icon: Eye, label: 'Future Predictions', color: 'text-purple-400' },
    { icon: Sparkles, label: 'Spiritual Remedies', color: 'text-accent' },
  ];

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

          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Left: Form (3 cols) */}
              <div className="lg:col-span-3">
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
                          : validationError
                          ? 'border-destructive bg-destructive/5'
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
                            className="relative aspect-square max-h-80 mx-auto"
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
                            {validationError ? (
                              <div className="absolute bottom-4 left-4 right-4 bg-destructive/90 backdrop-blur-sm rounded-xl p-3 text-center">
                                <p className="text-sm font-medium text-destructive-foreground flex items-center justify-center gap-2">
                                  <AlertCircle className="w-4 h-4" />
                                  Palm verification failed
                                </p>
                              </div>
                            ) : (
                              <div className="absolute bottom-4 left-4 right-4 bg-card/90 backdrop-blur-sm rounded-xl p-3 text-center">
                                <p className="text-sm font-medium text-foreground flex items-center justify-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  Image uploaded successfully
                                </p>
                              </div>
                            )}
                          </motion.div>
                        ) : (
                          <motion.label
                            key="upload"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center p-8 sm:p-12 cursor-pointer"
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
                              Supports: JPG, PNG only (Max 10MB)
                            </p>
                            <input
                              type="file"
                              accept="image/jpeg,image/png"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                          </motion.label>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Photo Guidelines */}
                    <div className="mt-4 p-4 bg-muted/30 rounded-2xl border border-border">
                      <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        <Camera className="w-4 h-4 text-accent" />
                        Photo Guidelines for Best Results
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Hand className="w-4 h-4 text-accent/70" />
                          Open palm facing camera
                        </div>
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4 text-accent/70" />
                          Good lighting on palm
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-accent/70" />
                          Palm lines clearly visible
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-accent/70" />
                          Only one hand visible
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>

                  {/* Validation Error Card */}
                  <AnimatePresence>
                    {validationError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-destructive/10 border border-destructive/30 rounded-2xl p-6"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-6 h-6 text-destructive" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-2">
                              This does not look like a clear palm photo
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              {validationError.reason}
                            </p>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-foreground">Suggestions:</p>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {validationError.suggestions.map((suggestion, i) => (
                                  <li key={i} className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                                    {suggestion}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <Button
                              type="button"
                              onClick={removeImage}
                              className="mt-4 btn-gold"
                            >
                              Reupload Photo
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form Fields */}
                  <AnimatedSection delay={0.2} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
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
                          {getStepLabel(processingStep)}
                        </span>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Start Free Palm Scan
                        </>
                      )}
                    </Button>
                    
                    {/* Trust signals below button */}
                    <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-green-500" />
                        Image not stored
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-accent" />
                        100% private & safe
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-accent" />
                        Free preview included
                      </span>
                    </div>
                  </AnimatedSection>
                </form>
              </div>

              {/* Right: Report Preview Sidebar (2 cols) */}
              <div className="lg:col-span-2">
                <AnimatedSection delay={0.4}>
                  <div className="glass-premium rounded-3xl p-6 border border-accent/20 sticky top-28">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-foreground text-base">
                          Your Report Includes
                        </h3>
                        <p className="text-xs text-muted-foreground">Detailed AI analysis</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {reportPreviewSections.map(({ icon: Icon, label, color }, i) => (
                        <motion.div
                          key={label}
                          initial={{ opacity: 0, x: 10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + i * 0.08 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50"
                        >
                          <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
                          <span className="text-sm text-foreground">{label}</span>
                          <Lock className="w-3 h-3 text-muted-foreground ml-auto" />
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-5 p-3 rounded-xl bg-accent/5 border border-accent/10 text-center">
                      <p className="text-xs text-muted-foreground">
                        <span className="text-accent font-medium">Free preview</span> included with every scan.
                        <br />
                        Unlock full report for just <span className="text-accent font-bold">₹99</span>
                      </p>
                    </div>

                    {/* Social proof */}
                    <div className="mt-5 flex items-center justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                      ))}
                      <span className="text-xs text-muted-foreground ml-2">4.9/5 from 50,000+ users</span>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </div>
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
            <div className="text-center max-w-md mx-auto px-4">
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
                  <img src={palmIconGold} alt="Palm" className="w-12 h-12 object-contain" />
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.h2
                  key={getStepLabel(processingStep)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl font-serif font-bold text-foreground mb-4"
                >
                  {getStepLabel(processingStep)}
                </motion.h2>
              </AnimatePresence>

              {/* Progress Steps */}
              <div className="space-y-3 text-left bg-card/50 rounded-2xl p-4 border border-border">
                {[
                  { step: 'uploading', label: 'Securing your palm image', icon: Upload },
                  { step: 'validating', label: 'AI verifying palm clarity', icon: Eye },
                  { step: 'analyzing', label: 'Decoding your destiny lines', icon: Hand },
                  { step: 'saving', label: 'Generating destiny report', icon: CheckCircle },
                ].map(({ step, label, icon: Icon }) => {
                  const stepOrder = ['uploading', 'validating', 'analyzing', 'saving'];
                  const currentIndex = stepOrder.indexOf(processingStep);
                  const stepIndex = stepOrder.indexOf(step);
                  const isComplete = stepIndex < currentIndex;
                  const isCurrent = step === processingStep;
                  
                  return (
                    <div 
                      key={step}
                      className={`flex items-center gap-3 transition-all ${
                        isComplete ? 'text-green-500' : isCurrent ? 'text-accent' : 'text-muted-foreground'
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : isCurrent ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Icon className="w-5 h-5 opacity-50" />
                      )}
                      <span className={`text-sm ${isCurrent ? 'font-medium' : ''}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                This may take 15-20 seconds
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
