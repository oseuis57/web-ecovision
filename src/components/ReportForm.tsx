import { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Camera, MapPin, Loader2, X, Upload } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ReportFormProps {
  onSubmit: (report: any) => void;
  onCancel: () => void;
}

const POLLUTION_TYPES = [
  'Residuos Sólidos',
  'Contaminación del Agua',
  'Contaminación del Aire',
  'Contaminación Acústica',
  'Contaminación Visual',
  'Contaminación del Suelo'
];

const POLLUTION_LEVELS = ['Bajo', 'Moderado', 'Alto', 'Crítico'];

export function ReportForm({ onSubmit, onCancel }: ReportFormProps) {
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResults, setAiResults] = useState<{ type: string; level: string } | null>(null);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        simulateAIAnalysis();
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateAIAnalysis = () => {
    setAnalyzing(true);
    // Simulate AI processing
    setTimeout(() => {
      const randomType = POLLUTION_TYPES[Math.floor(Math.random() * POLLUTION_TYPES.length)];
      const randomLevel = POLLUTION_LEVELS[Math.floor(Math.random() * POLLUTION_LEVELS.length)];
      setAiResults({ type: randomType, level: randomLevel });
      setAnalyzing(false);
    }, 2000);
  };

  const handleSubmit = () => {
    if (!image || !aiResults) return;

    // Simulate GPS location
    const location = {
      lat: 19.4326 + (Math.random() - 0.5) * 0.1,
      lng: -99.1332 + (Math.random() - 0.5) * 0.1,
      address: 'Ciudad de México, México'
    };

    onSubmit({
      type: aiResults.type,
      level: aiResults.level,
      description,
      location,
      image
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-900">Nuevo Reporte de Contaminación</h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Image Capture */}
        <div>
          <Label>Fotografía del Incidente</Label>
          <div className="mt-2">
            {!image ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-600">
                    <span className="text-green-600">Haz clic para capturar</span> o subir imagen
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG o JPEG (MAX. 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageCapture}
                />
              </label>
            ) : (
              <div className="relative">
                <ImageWithFallback
                  src={image}
                  alt="Captured pollution"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setImage(null);
                    setAiResults(null);
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* AI Analysis Results */}
        {analyzing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <div>
                <p className="text-blue-900">Analizando imagen con IA...</p>
                <p className="text-sm text-blue-700">Clasificando tipo y nivel de contaminación</p>
              </div>
            </div>
          </div>
        )}

        {aiResults && !analyzing && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-900 mb-3">✓ Análisis completado</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-green-700">Tipo de Contaminación</Label>
                <p className="text-green-900 mt-1">{aiResults.type}</p>
              </div>
              <div>
                <Label className="text-xs text-green-700">Nivel de Severidad</Label>
                <p className="text-green-900 mt-1">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs ${
                      aiResults.level === 'Crítico'
                        ? 'bg-red-100 text-red-800'
                        : aiResults.level === 'Alto'
                        ? 'bg-orange-100 text-orange-800'
                        : aiResults.level === 'Moderado'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {aiResults.level}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Location Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <p className="text-sm text-gray-900">Ubicación GPS</p>
              <p className="text-xs text-gray-600 mt-1">
                La ubicación se capturará automáticamente al enviar el reporte
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Descripción Adicional (Opcional)</Label>
          <Textarea
            id="description"
            placeholder="Describe detalles adicionales sobre el incidente..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-2"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-green-500 to-blue-500"
            onClick={handleSubmit}
            disabled={!image || !aiResults || analyzing}
          >
            <Upload className="w-4 h-4 mr-2" />
            Enviar Reporte
          </Button>
        </div>
      </div>
    </div>
  );
}
