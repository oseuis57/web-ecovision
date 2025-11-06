import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  AlertCircle,
  Droplets,
  Wind,
  Volume2,
  Eye,
  Leaf,
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';

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

interface AdminDashboardProps {
  reports: Report[];
  onUpdateStatus: (id: string, status: string) => void;
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

export function AdminDashboard({ reports, onUpdateStatus }: AdminDashboardProps) {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [detailsReport, setDetailsReport] = useState<Report | null>(null);
  const [mapReport, setMapReport] = useState<Report | null>(null);
  const [assignReport, setAssignReport] = useState<Report | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamContact, setTeamContact] = useState('');

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    inProgress: reports.filter(r => r.status === 'in-progress').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    critical: reports.filter(r => r.level === 'Crítico').length,
  };

  const filteredReports = reports.filter(r => {
    if (selectedTab === 'all') return true;
    return r.status === selectedTab;
  });

  const getTypeStats = () => {
    const types = reports.reduce((acc, report) => {
      acc[report.type] = (acc[report.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(types).sort((a, b) => b[1] - a[1]);
  };

  const handleAssignTeam = () => {
    if (assignReport && teamName && teamContact) {
      alert(`Equipo "${teamName}" asignado al reporte #${assignReport.id}\nContacto: ${teamContact}`);
      setAssignReport(null);
      setTeamName('');
      setTeamContact('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Stats */}
      <div>
        <h2 className="text-gray-900 mb-4">Panel de Autoridades</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reportes</p>
                <p className="text-2xl text-gray-900 mt-1">{stats.total}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4 bg-orange-50 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">Pendientes</p>
                <p className="text-2xl text-orange-900 mt-1">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">En Proceso</p>
                <p className="text-2xl text-blue-900 mt-1">{stats.inProgress}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Resueltos</p>
                <p className="text-2xl text-green-900 mt-1">{stats.resolved}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Críticos</p>
                <p className="text-2xl text-red-900 mt-1">{stats.critical}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </Card>
        </div>
      </div>

      {/* Type Distribution */}
      <Card className="p-6">
        <h3 className="text-gray-900 mb-4">Distribución por Tipo de Contaminación</h3>
        <div className="space-y-3">
          {getTypeStats().map(([type, count]) => {
            const percentage = (count / stats.total) * 100;
            return (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(type)}
                    <span className="text-sm text-gray-700">{type}</span>
                  </div>
                  <span className="text-sm text-gray-600">{count} reportes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Reports List */}
      <Card className="p-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="in-progress">En Proceso</TabsTrigger>
            <TabsTrigger value="resolved">Resueltos</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab}>
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <Card key={report.id} className="p-4">
                  <div className="flex gap-4">
                    <ImageWithFallback
                      src={report.image}
                      alt={report.type}
                      className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(report.type)}
                          <h4 className="text-gray-900">{report.type}</h4>
                          <Badge
                            className={
                              report.level === 'Crítico'
                                ? 'bg-red-100 text-red-800'
                                : report.level === 'Alto'
                                ? 'bg-orange-100 text-orange-800'
                                : report.level === 'Moderado'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }
                          >
                            {report.level}
                          </Badge>
                        </div>
                        
                        <Select
                          value={report.status}
                          onValueChange={(value) => onUpdateStatus(report.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="in-progress">En Proceso</SelectItem>
                            <SelectItem value="resolved">Resuelto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{report.description}</p>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-4 h-4" />
                          {report.location.address}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-4 h-4" />
                          {report.timestamp.toLocaleString('es-MX', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setDetailsReport(report)}>
                          Ver Detalles
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setMapReport(report)}>
                          Ver en Mapa
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setAssignReport(report)}>
                          Asignar Equipo
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Modal Ver Detalles */}
      <Dialog open={!!detailsReport} onOpenChange={() => setDetailsReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Reporte #{detailsReport?.id}</DialogTitle>
            <DialogDescription>
              Información completa del reporte de contaminación
            </DialogDescription>
          </DialogHeader>
          {detailsReport && (
            <div className="space-y-4">
              <ImageWithFallback
                src={detailsReport.image}
                alt={detailsReport.type}
                className="w-full h-64 object-cover rounded-lg"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Tipo de Contaminación</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeIcon(detailsReport.type)}
                    <p className="text-gray-900">{detailsReport.type}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-gray-600">Nivel de Severidad</Label>
                  <div className="mt-1">
                    <Badge
                      className={
                        detailsReport.level === 'Crítico'
                          ? 'bg-red-100 text-red-800'
                          : detailsReport.level === 'Alto'
                          ? 'bg-orange-100 text-orange-800'
                          : detailsReport.level === 'Moderado'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }
                    >
                      {detailsReport.level}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-600">Estado</Label>
                  <p className="text-gray-900 mt-1">
                    {detailsReport.status === 'pending' ? 'Pendiente' :
                     detailsReport.status === 'in-progress' ? 'En Proceso' :
                     'Resuelto'}
                  </p>
                </div>

                <div>
                  <Label className="text-gray-600">Fecha y Hora</Label>
                  <p className="text-gray-900 mt-1">
                    {detailsReport.timestamp.toLocaleString('es-PE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-gray-600">Descripción</Label>
                <p className="text-gray-900 mt-1">{detailsReport.description}</p>
              </div>

              <div>
                <Label className="text-gray-600">Ubicación</Label>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <p className="text-gray-900">{detailsReport.location.address}</p>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Coordenadas: {detailsReport.location.lat.toFixed(4)}, {detailsReport.location.lng.toFixed(4)}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsReport(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Ver en Mapa */}
      <Dialog open={!!mapReport} onOpenChange={() => setMapReport(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Ubicación en el Mapa</DialogTitle>
            <DialogDescription>
              Coordenadas GPS del reporte
            </DialogDescription>
          </DialogHeader>
          {mapReport && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-100 via-green-50 to-blue-100 rounded-lg p-8 relative overflow-hidden" style={{ height: '400px' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
                      <h4 className="text-gray-900 mb-2">{mapReport.type}</h4>
                      <p className="text-sm text-gray-600 mb-3">{mapReport.location.address}</p>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">
                          <strong>Latitud:</strong> {mapReport.location.lat.toFixed(6)}
                        </p>
                        <p className="text-gray-600">
                          <strong>Longitud:</strong> {mapReport.location.lng.toFixed(6)}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        className="mt-3 w-full"
                        onClick={() => {
                          window.open(
                            `https://www.google.com/maps/search/?api=1&query=${mapReport.location.lat},${mapReport.location.lng}`,
                            '_blank'
                          );
                        }}
                      >
                        Abrir en Google Maps
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMapReport(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Asignar Equipo */}
      <Dialog open={!!assignReport} onOpenChange={() => setAssignReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Equipo de Respuesta</DialogTitle>
            <DialogDescription>
              Asigna un equipo para atender el reporte #{assignReport?.id}
            </DialogDescription>
          </DialogHeader>
          {assignReport && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  {getTypeIcon(assignReport.type)}
                  <p className="text-sm text-gray-900">{assignReport.type}</p>
                </div>
                <p className="text-xs text-gray-600">{assignReport.location.address}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="team-name">Nombre del Equipo</Label>
                  <Input
                    id="team-name"
                    placeholder="Ej: Equipo de Limpieza Municipal"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="team-contact">Contacto del Equipo</Label>
                  <Input
                    id="team-contact"
                    placeholder="Teléfono o email"
                    value={teamContact}
                    onChange={(e) => setTeamContact(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAssignReport(null);
              setTeamName('');
              setTeamContact('');
            }}>
              Cancelar
            </Button>
            <Button onClick={handleAssignTeam} disabled={!teamName || !teamContact}>
              Asignar Equipo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
