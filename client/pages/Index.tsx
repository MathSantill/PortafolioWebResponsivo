import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Play, Square, Target, Settings, Download, Users, Brain, Box, Bot, GraduationCap, Home } from 'lucide-react';

declare global {
  interface Window {
    webgazer: any;
    h337: any;
    saveDataAcrossSessions: boolean;
  }
}

export default function Index() {
  const [isTracking, setIsTracking] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [gazeData, setGazeData] = useState<{ x: number; y: number; value: number }[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [status, setStatus] = useState('Presione "Iniciar seguimiento" para comenzar');
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [error, setError] = useState<string | null>(null);
  const [calibrating, setCalibrating] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [heatmapRadius, setHeatmapRadius] = useState(40);
  const [heatmapOpacity, setHeatmapOpacity] = useState(60);
  const [notification, setNotification] = useState<string | null>(null);
  
  const heatmapRef = useRef<HTMLDivElement>(null);
  const heatmapInstance = useRef<any>(null);
  const calibrationPointRef = useRef<HTMLDivElement>(null);
  const gazeDotRef = useRef<HTMLDivElement>(null);
  const lastGazeTime = useRef(0);
  const trackingDataRef = useRef<{ x: number; y: number; value: number }[]>([]);

  // Puntos de calibración estratégicos
  const calibrationPoints = [
    { x: window.innerWidth * 0.1, y: window.innerHeight * 0.1 },
    { x: window.innerWidth * 0.9, y: window.innerHeight * 0.1 },
    { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 },
    { x: window.innerWidth * 0.1, y: window.innerHeight * 0.9 },
    { x: window.innerWidth * 0.9, y: window.innerHeight * 0.9 }
  ];

  useEffect(() => {
    checkCameraSupport();
    return () => {
      if (window.webgazer) {
        window.webgazer.end();
      }
    };
  }, []);

  const showNotification = (message: string, duration: number = 3000) => {
    setNotification(message);
    setTimeout(() => setNotification(null), duration);
  };

  const checkCameraSupport = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Su navegador no soporta acceso a la cámara');
        setStatus('Navegador no compatible');
        return;
      }

      const isSecure = window.location.protocol === 'https:' || 
                      window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1';
      
      if (!isSecure) {
        setError('Se requiere HTTPS para acceder a la cámara');
        setStatus('Conexión no segura');
        return;
      }

      await initializeWebGazer();
    } catch (error) {
      console.error('Error checking camera support:', error);
      setError('Error verificando soporte de cámara');
    }
  };

  const initializeWebGazer = async () => {
    try {
      setStatus('Cargando WebGazer...');
      
      if (!window.webgazer) {
        const script = document.createElement('script');
        script.src = 'https://webgazer.cs.brown.edu/webgazer.js';
        script.onload = () => setupWebGazer();
        script.onerror = () => {
          setError('Error cargando WebGazer.js');
          setStatus('Error de carga');
        };
        document.head.appendChild(script);
      } else {
        setupWebGazer();
      }
    } catch (error) {
      console.error('Error initializing WebGazer:', error);
      setError('Error al inicializar WebGazer');
      setStatus('Error de inicialización');
    }
  };

  const setupWebGazer = () => {
    setStatus('Configurando WebGazer...');
    
    window.webgazer
      .setRegression('ridge')
      .setTracker('clmtrackr')
      .setGazeListener((data: any) => {
        if (data && isTracking && !calibrating) {
          const now = Date.now();
          if (now - lastGazeTime.current < 50) return;
          lastGazeTime.current = now;

          if (data.x < 0 || data.y < 0 || data.x > window.innerWidth || data.y > window.innerHeight) return;

          // Actualizar punto visual
          if (gazeDotRef.current) {
            gazeDotRef.current.style.left = data.x + 'px';
            gazeDotRef.current.style.top = data.y + 'px';
            gazeDotRef.current.style.display = 'block';
          }

          // Registrar datos
          const newPoint = { x: data.x, y: data.y, value: 1 };
          trackingDataRef.current.push(newPoint);
          setGazeData(prev => [...prev, newPoint]);

          // Actualizar mapa de calor en tiempo real
          if (heatmapInstance.current) {
            heatmapInstance.current.addData(newPoint);
          }
        }
      })
      .begin()
      .then(() => {
        setIsInitialized(true);
        setStatus('Presione "Iniciar seguimiento" para comenzar');
        setError(null);
        
        // Configurar no guardar datos entre sesiones
        window.saveDataAcrossSessions = false;

        // Ocultar el video overlay por defecto
        setTimeout(() => {
          const webgazerVideoContainer = document.getElementById('webgazerVideoContainer');
          if (webgazerVideoContainer) {
            webgazerVideoContainer.style.display = 'none';
          }
        }, 1000);

        // Inicializar mapa de calor
        initHeatmap();
      })
      .catch((error: any) => {
        console.error('WebGazer setup error:', error);
        setError(`Error configurando WebGazer: ${error.message || 'Verifique permisos de cámara'}`);
        setStatus('Error de configuración');
        setCameraPermission('denied');
      });
  };

  const initHeatmap = () => {
    if (!window.h337) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/heatmapjs@2.0.5/heatmap.min.js';
      script.onload = () => createHeatmap();
      document.head.appendChild(script);
    } else {
      createHeatmap();
    }
  };

  const createHeatmap = () => {
    if (!heatmapRef.current) return;

    heatmapInstance.current = window.h337.create({
      container: heatmapRef.current,
      radius: heatmapRadius,
      maxOpacity: heatmapOpacity / 100,
      minOpacity: 0.05,
      blur: 0.85,
      gradient: {
        '0.1': '#2c7be5',
        '0.5': '#00d97e', 
        '0.9': '#ffcc00',
        '1.0': '#ff3d3d'
      }
    });
  };

  const updateHeatmapConfig = () => {
    if (!heatmapInstance.current) return;
    
    heatmapInstance.current.configure({
      radius: heatmapRadius,
      maxOpacity: heatmapOpacity / 100
    });

    if (trackingDataRef.current.length > 0) {
      heatmapInstance.current.setData({
        max: 5,
        data: trackingDataRef.current
      });
    }
  };

  const startTracking = () => {
    if (!isInitialized || isTracking) return;
    
    setIsTracking(true);
    trackingDataRef.current = [];
    setGazeData([]);
    setShowHeatmap(false);
    setStatus('Seguimiento activo - Mira alrededor');
    
    window.webgazer.resume();
    
    // Mostrar video container
    const webgazerVideoContainer = document.getElementById('webgazerVideoContainer');
    if (webgazerVideoContainer) {
      webgazerVideoContainer.style.display = 'block';
      webgazerVideoContainer.style.position = 'fixed';
      webgazerVideoContainer.style.bottom = '20px';
      webgazerVideoContainer.style.left = '20px';
      webgazerVideoContainer.style.width = '180px';
      webgazerVideoContainer.style.height = '135px';
      webgazerVideoContainer.style.borderRadius = '10px';
      webgazerVideoContainer.style.overflow = 'hidden';
      webgazerVideoContainer.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
      webgazerVideoContainer.style.zIndex = '1001';
      webgazerVideoContainer.style.background = 'rgba(0,0,0,0.7)';
    }

    showNotification('Seguimiento ocular iniciado!');
  };

  const stopTracking = () => {
    if (!isTracking) return;
    
    setIsTracking(false);
    setStatus('Seguimiento detenido - Mapa de calor visible');
    
    window.webgazer.pause();

    // Ocultar punto visual
    if (gazeDotRef.current) {
      gazeDotRef.current.style.display = 'none';
    }

    // Generar mapa de calor final
    if (trackingDataRef.current.length > 0) {
      if (heatmapInstance.current) {
        heatmapInstance.current.setData({
          max: 5,
          data: trackingDataRef.current
        });
      }
      setShowHeatmap(true);
    }

    // Ocultar video container
    const webgazerVideoContainer = document.getElementById('webgazerVideoContainer');
    if (webgazerVideoContainer) {
      webgazerVideoContainer.style.display = 'none';
    }

    showNotification('Mapa de calor generado!');
  };

  const startCalibration = () => {
    if (!isTracking || calibrating) return;
    
    setCalibrating(true);
    setCalibrationStep(0);
    setStatus('Iniciando calibración...');
    
    showNextCalibrationPoint();
  };

  const showNextCalibrationPoint = () => {
    if (calibrationStep >= calibrationPoints.length) {
      finishCalibration();
      return;
    }

    const point = calibrationPoints[calibrationStep];
    
    if (calibrationPointRef.current) {
      calibrationPointRef.current.style.left = (point.x - 10) + 'px';
      calibrationPointRef.current.style.top = (point.y - 10) + 'px';
      calibrationPointRef.current.style.display = 'block';
    }

    setStatus(`Calibración: Paso ${calibrationStep + 1} de ${calibrationPoints.length} - Mire al punto naranja`);

    setTimeout(() => {
      if (window.webgazer) {
        window.webgazer.recordScreenPosition(point.x, point.y, 'click');
      }
      
      if (calibrationPointRef.current) {
        calibrationPointRef.current.style.display = 'none';
      }
      
      setCalibrationStep(prev => prev + 1);
      setTimeout(showNextCalibrationPoint, 300);
    }, 2000);
  };

  const finishCalibration = () => {
    setCalibrating(false);
    setStatus('Calibración completada! Seguimiento más preciso');
    showNotification('Calibración completada con éxito!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 text-zinc-100 font-sans text-lg leading-relaxed overflow-x-hidden">
      {/* Header */}
      <header className="text-center py-16 px-4">
        <h2 className="text-2xl mb-2">Hola, soy</h2>
        <h1 className="text-5xl font-bold mb-6">
          <span className="text-orange-500">Matheo Santillan</span><br />
          Desarrollador de Software
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Este es mi portafolio y CV. Aquí puedes ver ejemplos de mis proyectos y experiencia.
        </p>
        <Button className="bg-orange-500 hover:bg-orange-600 text-black font-semibold px-8 py-3 rounded-lg transition-all duration-300">
          <Download className="w-4 h-4 mr-2" />
          Descargar CV
        </Button>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4">
        {/* About Section */}
        <section className="my-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Feb946005173f46ecaca6960caf83b7de%2Fbc6c0852e11242bcae28c79a900b09f3?format=webp&width=800"
                alt="Tarjeta personalizada de Matheo Santillan"
                className="w-full rounded-xl shadow-2xl"
              />
            </div>
            <div>
              <Card className="bg-zinc-800 border-none text-white rounded-2xl h-full shadow-xl hover:transform hover:-translate-y-2 transition-all duration-300">
                <CardContent className="p-8">
                  <h2 className="text-orange-500 text-3xl font-bold mb-6">Acerca de mí</h2>
                  <p className="mb-4 text-zinc-300">
                    Soy una persona comprometida con el aprendizaje y con una fuerte motivación por entender cómo funcionan las cosas a nivel técnico. Me considero analítico, detallista y con una curiosidad constante por explorar nuevas ideas.
                  </p>
                  <p className="mb-6 text-zinc-300">
                    Actualmente me encuentro en formación dentro del área del desarrollo de software, donde combino estudios teóricos con ejercicios prácticos relacionados con programación, inteligencia artificial y resolución de problemas computacionales.
                  </p>
                  <Button variant="outline" className="border-zinc-600 text-white hover:bg-orange-500 hover:text-black transition-all duration-300">
                    Más acerca de mí
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="my-20 text-center">
          <h2 className="text-orange-500 text-4xl font-bold mb-12">Mis habilidades</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-zinc-800 border-none text-white rounded-2xl shadow-xl hover:transform hover:-translate-y-2 transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center justify-center">
                  <Box className="w-6 h-6 mr-3" />
                  Desarrollo orientado a objetos
                </h3>
                <p className="text-zinc-300">Código modular, reutilizable y fácil de mantener.</p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800 border-none text-white rounded-2xl shadow-xl hover:transform hover:-translate-y-2 transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center justify-center">
                  <Brain className="w-6 h-6 mr-3" />
                  Lógica de programación
                </h3>
                <p className="text-zinc-300">Resolver problemas con pensamiento estructurado y algoritmos eficientes.</p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800 border-none text-white rounded-2xl shadow-xl hover:transform hover:-translate-y-2 transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center justify-center">
                  <Users className="w-6 h-6 mr-3" />
                  Colaboración en equipo
                </h3>
                <p className="text-zinc-300">Trabajo conjunto con metodologías ágiles y comunicación efectiva.</p>
              </CardContent>
            </Card>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600 text-black font-semibold px-8 py-3 rounded-lg mt-8 transition-all duration-300">
            Ver más de mis skills →
          </Button>
        </section>

        {/* Projects Section */}
        <section className="my-20">
          <h2 className="text-orange-500 text-4xl font-bold text-center mb-12">Mis Proyectos</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-zinc-800 border-none text-white rounded-2xl shadow-xl hover:transform hover:-translate-y-2 transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Bot className="w-6 h-6 mr-3" />
                  Asistente Virtual
                </h3>
                <p className="text-zinc-300 mb-6">
                  Diseñado para ayudar a personas con discapacidad visual. Usa DialogFlow, Speech API y Python.
                </p>
                <Button variant="outline" className="border-zinc-600 text-white hover:bg-orange-500 hover:text-black w-full transition-all duration-300">
                  Ver más detalles
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800 border-none text-white rounded-2xl shadow-xl hover:transform hover:-translate-y-2 transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <GraduationCap className="w-6 h-6 mr-3" />
                  Aplicación Educativa
                </h3>
                <p className="text-zinc-300 mb-6">
                  App para niños con contenidos en 3D, interacción táctil y personajes animados. Hecho en Unity.
                </p>
                <Button variant="outline" className="border-zinc-600 text-white hover:bg-orange-500 hover:text-black w-full transition-all duration-300">
                  Ver más detalles
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800 border-none text-white rounded-2xl shadow-xl hover:transform hover:-translate-y-2 transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Home className="w-6 h-6 mr-3" />
                  Sistema de Control
                </h3>
                <p className="text-zinc-300 mb-6">
                  Plataforma IoT para manejar luces y sensores desde el móvil. Backend con Firebase y Node.js.
                </p>
                <Button variant="outline" className="border-zinc-600 text-white hover:bg-orange-500 hover:text-black w-full transition-all duration-300">
                  Ver más detalles
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 text-zinc-400 py-8 text-center">
        <p>© 2025 Matheo Santillan — <a href="mailto:matheo.santillan@uisek.edu.ec" className="text-orange-500 hover:text-orange-400">matheo.santillan@uisek.edu.ec</a></p>
      </footer>

      {/* Eye Tracking Controls */}
      <div className="fixed bottom-5 right-5 z-[1001]">
        <div 
          className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-all duration-300 z-[1002]"
          onClick={() => setShowControls(!showControls)}
        >
          <Eye className="w-6 h-6 text-black" />
        </div>
        
        {showControls && (
          <div className="absolute bottom-16 right-0 bg-zinc-900/95 rounded-xl p-4 w-56 shadow-xl z-[1001]">
            <div className="space-y-2 mb-4">
              <Button
                onClick={startTracking}
                disabled={!isInitialized || isTracking}
                className="w-full justify-start bg-zinc-700 hover:bg-zinc-600 text-white text-sm"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Iniciar seguimiento
              </Button>
              
              <Button
                onClick={startCalibration}
                disabled={!isTracking || calibrating}
                className="w-full justify-start bg-zinc-700 hover:bg-zinc-600 text-white text-sm"
                size="sm"
              >
                <Target className="w-4 h-4 mr-2" />
                {calibrating ? 'Calibrando...' : 'Calibrar'}
              </Button>
              
              <Button
                onClick={stopTracking}
                disabled={!isTracking}
                className="w-full justify-start bg-red-600 hover:bg-red-700 text-white text-sm"
                size="sm"
              >
                <Square className="w-4 h-4 mr-2" />
                Detener seguimiento
              </Button>
            </div>

            {/* Configuración del mapa de calor */}
            <div className="space-y-3 pt-3 border-t border-zinc-700">
              <div className="flex items-center justify-between">
                <label className="text-xs text-zinc-400">Tamaño: {heatmapRadius}px</label>
                <input 
                  type="range" 
                  min="10" 
                  max="80" 
                  value={heatmapRadius}
                  onChange={(e) => {
                    setHeatmapRadius(Number(e.target.value));
                    updateHeatmapConfig();
                  }}
                  className="w-16"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-zinc-400">Opacidad: {heatmapOpacity}%</label>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={heatmapOpacity}
                  onChange={(e) => {
                    setHeatmapOpacity(Number(e.target.value));
                    updateHeatmapConfig();
                  }}
                  className="w-16"
                />
              </div>
            </div>
            
            <div className="bg-zinc-800/50 text-zinc-300 p-2 rounded text-center text-xs mt-3">
              {status}
            </div>
          </div>
        )}
      </div>

      {/* Contenedor para el mapa de calor */}
      <div 
        ref={heatmapRef}
        className={`fixed top-0 left-0 w-full h-full pointer-events-none z-[1000] ${showHeatmap ? 'block' : 'hidden'}`}
      />
      
      {/* Punto de calibración */}
      <div 
        ref={calibrationPointRef}
        className="fixed w-5 h-5 bg-orange-500 rounded-full z-50 pointer-events-none hidden"
        style={{ boxShadow: '0 0 15px rgba(249, 115, 22, 0.8)' }}
      />
      
      {/* Punto de seguimiento visual */}
      <div 
        ref={gazeDotRef}
        className="fixed w-4 h-4 bg-green-500 rounded-full z-40 pointer-events-none hidden"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      
      {/* Notificación */}
      {notification && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-orange-500 text-black px-5 py-3 rounded-lg shadow-lg z-[1003] flex items-center">
          <Eye className="w-4 h-4 mr-2" />
          {notification}
        </div>
      )}
    </div>
  );
}
