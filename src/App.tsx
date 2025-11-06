import { useState } from 'react';
import { ReportForm } from './components/ReportForm';
import { MapView } from './components/MapView';
import { AdminDashboard } from './components/AdminDashboard';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Users, Map, Plus } from 'lucide-react';
import ecoVisionLogo from 'figma:asset/93d095607165da201f878cfdb5c7063654a80dd9.png';
import contaminacionAire from 'figma:asset/79adf38109f46a05f4fe7cb3e4f0408dcc2604a5.png';
import contaminacionAgua1 from 'figma:asset/f68a5aa398d252ce655f30509ed90d11b0ad9e10.png';
import contaminacionAgua2 from 'figma:asset/462fd6284026c70f9d4a05970631310e25dc68f9.png';

export default function App() {
  const [view, setView] = useState<'citizen' | 'admin'>('citizen');
  const [showReportForm, setShowReportForm] = useState(false);
  const [reports, setReports] = useState([
    {
      id: '1',
      type: 'Contaminación del Agua',
      level: 'Crítico',
      description: 'Río contaminado con residuos sólidos y plásticos',
      location: { lat: -12.0464, lng: -77.0428, address: 'Cercado de Lima, Lima' },
      image: contaminacionAgua1,
      timestamp: new Date('2025-10-02T10:30:00'),
      status: 'pending'
    },
    {
      id: '2',
      type: 'Contaminación del Agua',
      level: 'Alto',
      description: 'Agua estancada contaminada con desechos plásticos',
      location: { lat: -12.0565, lng: -77.1181, address: 'Callao, Provincia Constitucional del Callao' },
      image: contaminacionAgua2,
      timestamp: new Date('2025-10-03T14:15:00'),
      status: 'in-progress'
    },
    {
      id: '3',
      type: 'Contaminación del Aire',
      level: 'Crítico',
      description: 'Quema de residuos sólidos generando humo tóxico',
      location: { lat: -11.9932, lng: -76.9976, address: 'San Juan de Lurigancho, Lima' },
      image: contaminacionAire,
      timestamp: new Date('2025-10-05T09:00:00'),
      status: 'pending'
    },
    {
      id: '4',
      type: 'Residuos Sólidos',
      level: 'Alto',
      description: 'Acumulación de basura en espacio público',
      location: { lat: -12.2127, lng: -76.9388, address: 'Villa El Salvador, Lima' },
      image: contaminacionAire,
      timestamp: new Date('2025-10-07T11:45:00'),
      status: 'resolved'
    }
  ]);

  const handleNewReport = (report: any) => {
    const newReport = {
      ...report,
      id: Date.now().toString(),
      timestamp: new Date(),
      status: 'pending'
    };
    setReports([newReport, ...reports]);
    setShowReportForm(false);
  };

  const handleUpdateStatus = (id: string, status: string) => {
    setReports(reports.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={ecoVisionLogo} 
                alt="EcoVision Logo" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-gray-900">EcoVision</h1>
                <p className="text-sm text-gray-600">Artificial Intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Tabs value={view} onValueChange={(v) => setView(v as any)}>
                <TabsList>
                  <TabsTrigger value="citizen" className="gap-2">
                    <Map className="w-4 h-4" />
                    Mapa
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="gap-2">
                    <Users className="w-4 h-4" />
                    Autoridades
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {view === 'citizen' ? (
          <div className="relative">
            <MapView reports={reports} />
            
            {/* Floating Action Button */}
            {!showReportForm && (
              <Button
                size="lg"
                className="fixed bottom-8 right-8 rounded-full h-16 w-16 shadow-lg bg-gradient-to-br from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                onClick={() => setShowReportForm(true)}
              >
                <Plus className="w-8 h-8" />
              </Button>
            )}

            {/* Report Form Modal */}
            {showReportForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <ReportForm
                    onSubmit={handleNewReport}
                    onCancel={() => setShowReportForm(false)}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <AdminDashboard
            reports={reports}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </main>
    </div>
  );
}
