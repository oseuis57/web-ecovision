import { useState, useCallback, useRef, useEffect } from 'react';
import { MapPin, AlertCircle, Droplets, Wind, Volume2, Eye, Leaf, ZoomIn, ZoomOut } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Report {
  id: string;
  type: string;
  level: string;
  description: string;
  location: { lat: number; lng: number; address: string };
  image: string;
  timestamp: Date;
  status: string;
}

interface MapViewProps {
  reports: Report[];
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Residuos Sólidos':
      return <AlertCircle className="w-4 h-4" />;
    case 'Contaminación del Agua':
      return <Droplets className="w-4 h-4" />;
    case 'Contaminación del Aire':
      return <Wind className="w-4 h-4" />;
    case 'Contaminación Acústica':
      return <Volume2 className="w-4 h-4" />;
    case 'Contaminación Visual':
      return <Eye className="w-4 h-4" />;
    case 'Contaminación del Suelo':
      return <Leaf className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

const getLevelColor = (level: string) => {
  switch (level) {
    case 'Crítico':
      return 'bg-red-500';
    case 'Alto':
      return 'bg-orange-500';
    case 'Moderado':
      return 'bg-yellow-500';
    case 'Bajo':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

export function MapView({ reports }: MapViewProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  const filteredReports = reports.filter(r => 
    filter === 'all' || r.type === filter
  );

  const uniqueTypes = ['all', ...Array.from(new Set(reports.map(r => r.type)))];

  // Convertir coordenadas geográficas a posición en el mapa (centrado en Lima, Perú)
  const latLngToPosition = (lat: number, lng: number) => {
    const centerLat = -12.0464;
    const centerLng = -77.0428;
    
    const x = 50 + (lng - centerLng) * 2000;
    const y = 50 + (centerLat - lat) * 2000;
    
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(3, prev + 0.2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(0.5, prev - 0.2));
  };

  useEffect(() => {
    const handleMouseUpGlobal = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUpGlobal);
    return () => window.removeEventListener('mouseup', handleMouseUpGlobal);
  }, []);

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Map Area */}
      <div className="flex-1 relative bg-gray-100 overflow-hidden">
        <div
          ref={mapRef}
          className={`absolute inset-0 ${isDragging ? 'cursor-grabbing' 
          : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Map Background */}
          <div
            className="absolute w-[200%] h-[200%] bg-gradient-to-br from-blue-100 via-green-50 to-blue-100"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
          >
            {/* Map Grid Pattern */}
            <div 
              className="absolute inset-0 opacity-10" 
              style={{
                backgroundImage: `
                  linear-gradient(to right, #000 1px, transparent 1px),
                  linear-gradient(to bottom, #000 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
              }}
            />

            {/* Street-like lines for realism */}
            <svg className="absolute inset-0 w-full h-full opacity-20" style={{ pointerEvents: 'none' }}>
              <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#666" strokeWidth="2" />
              <line x1="0" y1="60%" x2="100%" y2="60%" stroke="#666" strokeWidth="2" />
              <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#666" strokeWidth="2" />
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#666" strokeWidth="3" />
              <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#666" strokeWidth="2" />
            </svg>

            {/* Report Markers */}
            {filteredReports.map((report) => {
              const pos = latLngToPosition(report.location.lat, report.location.lng);
              
              return (
                <button
                  key={report.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-full transition-all hover:scale-110 z-20 ${
                    selectedReport?.id === report.id ? 'scale-125 z-30' : ''
                  }`}
                  style={{ 
                    left: `${pos.x}%`, 
                    top: `${pos.y}%`,
                    pointerEvents: 'auto'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedReport(report);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className={`w-12 h-12 ${getLevelColor(report.level)} rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white`}>
                    {getTypeIcon(report.type)}
                  </div>
                  <div className={`w-3 h-3 ${getLevelColor(report.level)} rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r-4 border-b-4 border-white`}></div>
                  
                  {/* Info popup on hover */}
                  {selectedReport?.id === report.id && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl p-3 min-w-[200px] z-40">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(report.type)}
                        <span className="text-sm text-gray-900">{report.type}</span>
                      </div>
                      <Badge
                        className={`mb-2 ${
                          report.level === 'Crítico'
                            ? 'bg-red-100 text-red-800'
                            : report.level === 'Alto'
                            ? 'bg-orange-100 text-orange-800'
                            : report.level === 'Moderado'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {report.level}
                      </Badge>
                      <p className="text-xs text-gray-600">{report.description}</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg flex flex-col z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            className="rounded-b-none border-b"
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            className="rounded-t-none"
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10">
          <p className="text-sm text-gray-900 mb-2">Nivel de Severidad</p>
          <div className="space-y-2">
            {['Bajo', 'Moderado', 'Alto', 'Crítico'].map((level) => (
              <div key={level} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getLevelColor(level)}`}></div>
                <span className="text-xs text-gray-600">{level}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Card */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 min-w-[200px] z-10">
          <p className="text-sm text-gray-600 mb-2">Reportes Activos</p>
          <p className="text-gray-900">{filteredReports.length}</p>
          <div className="mt-3 pt-3 border-t space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Pendientes:</span>
              <span className="text-orange-600">{reports.filter(r => r.status === 'pending').length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">En Proceso:</span>
              <span className="text-blue-600">{reports.filter(r => r.status === 'in-progress').length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Resueltos:</span>
              <span className="text-green-600">{reports.filter(r => r.status === 'resolved').length}</span>
            </div>
          </div>
        </div>

        {/* Map Instructions */}
        <div className="absolute bottom-4 right-4 bg-white/90 rounded-lg shadow-lg px-3 py-2 z-10">
          <p className="text-xs text-gray-600">Arrastra para mover • Rueda para zoom</p>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-gray-900 mb-3">Filtrar por Tipo</h3>
          <div className="flex flex-wrap gap-2">
            {uniqueTypes.map((type) => (
              <Button
                key={type}
                variant={filter === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(type)}
                className={filter === type ? 'bg-gradient-to-r from-green-500 to-blue-500' : ''}
              >
                {type === 'all' ? 'Todos' : type}
              </Button>
            ))}
          </div>
        </div>

        {selectedReport ? (
          <div className="p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedReport(null)}
              className="mb-4"
            >
              ← Volver a la lista
            </Button>
            
            <Card className="overflow-hidden">
              <ImageWithFallback
                src={selectedReport.image}
                alt={selectedReport.type}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(selectedReport.type)}
                    <h4 className="text-gray-900">{selectedReport.type}</h4>
                  </div>
                  <Badge
                    className={
                      selectedReport.level === 'Crítico'
                        ? 'bg-red-100 text-red-800'
                        : selectedReport.level === 'Alto'
                        ? 'bg-orange-100 text-orange-800'
                        : selectedReport.level === 'Moderado'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }
                  >
                    {selectedReport.level}
                  </Badge>
                </div>

                <p className="text-sm text-gray-600">{selectedReport.description}</p>

                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-600">{selectedReport.location.address}</span>
                </div>

                <div className="text-xs text-gray-500">
                  {selectedReport.timestamp.toLocaleString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>

                <div className="pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Estado:</span>
                    <Badge variant="outline">
                      {selectedReport.status === 'pending' ? 'Pendiente' :
                       selectedReport.status === 'in-progress' ? 'En Proceso' :
                       'Resuelto'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="divide-y">
            {filteredReports.map((report) => (
              <button
                key={report.id}
                className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex gap-3">
                  <ImageWithFallback
                    src={report.image}
                    alt={report.type}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeIcon(report.type)}
                      <span className="text-sm text-gray-900 truncate">{report.type}</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {report.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge
                        className={`text-xs ${
                          report.level === 'Crítico'
                            ? 'bg-red-100 text-red-800'
                            : report.level === 'Alto'
                            ? 'bg-orange-100 text-orange-800'
                            : report.level === 'Moderado'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {report.level}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {report.timestamp.toLocaleDateString('es-MX')}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
