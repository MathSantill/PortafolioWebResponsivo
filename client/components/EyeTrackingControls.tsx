import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface GazePoint {
  x: number;
  y: number;
  value: number;
}

declare global {
  interface Window {
    webgazer: any;
    h337: any;
  }
}

export default function EyeTrackingControls() {
  const [isTracking, setIsTracking] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState(0);
  const [status, setStatus] = useState('Presione "Iniciar seguimiento" para comenzar');
  const [gazePosition, setGazePosition] = useState({ x: 0, y: 0, visible: false });
  const [calibrationPoint, setCalibrationPoint] = useState({ x: 0, y: 0, visible: false });
  const [notification, setNotification] = useState({ text: '', visible: false });
  const [radius, setRadius] = useState(40);
  const [opacity, setOpacity] = useState(60);

  const gazePoints = useRef<GazePoint[]>([]);
  const heatmap = useRef<any>(null);
  const lastGazeTime = useRef(0);

  const calibrationPoints = [
    { x: window.innerWidth * 0.1, y: window.innerHeight * 0.1 },
    { x: window.innerWidth * 0.9, y: window.innerHeight * 0.1 },
    { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 },
    { x: window.innerWidth * 0.1, y: window.innerHeight * 0.9 },
    { x: window.innerWidth * 0.9, y: window.innerHeight * 0.9 }
  ];

  const showNotification = (text: string, duration = 3000) => {
    setNotification({ text, visible: true });
    setTimeout(() => setNotification({ text: '', visible: false }), duration);
  };

  const initHeatmap = () => {
    if (!window.h337) return;
    
    const container = document.getElementById('heatmapContainer');
    if (!container) return;

    heatmap.current = window.h337.create({
      container: container,
      radius: radius,
      maxOpacity: opacity / 100,
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
    if (!heatmap.current) return;
    
    heatmap.current.configure({
      radius: radius,
      maxOpacity: opacity / 100
    });
    
    if (gazePoints.current.length > 0) {
      heatmap.current.setData({
        max: 5,
        data: gazePoints.current
      });
    }
  };

  const startTracking = () => {
    if (!window.webgazer) {
      showNotification('WebGazer no está disponible');
      return;
    }

    setIsTracking(true);
    gazePoints.current = [];
    setGazePosition(prev => ({ ...prev, visible: true }));

    window.webgazer.resume();
    window.webgazer.showVideoPreview(true).showPredictionPoints(true);

    window.webgazer.setGazeListener((data: any) => {
      if (!isTracking || !data || isCalibrating) return;
      
      if (data.x < 0 || data.y < 0 || data.x > window.innerWidth || data.y > window.innerHeight) return;
      
      const now = Date.now();
      if (now - lastGazeTime.current < 50) return;
      lastGazeTime.current = now;
      
      setGazePosition({ x: data.x, y: data.y, visible: true });
      
      const point = { x: data.x, y: data.y, value: 1 };
      gazePoints.current.push(point);
      
      if (heatmap.current) {
        heatmap.current.addData(point);
      }
    });

    setStatus('Seguimiento activo - Mira alrededor');
    showNotification('Seguimiento ocular iniciado!');
  };

  const stopTracking = () => {
    if (!window.webgazer) return;

    setIsTracking(false);
    window.webgazer.pause();
    setGazePosition(prev => ({ ...prev, visible: false }));

    if (gazePoints.current.length > 0 && heatmap.current) {
      heatmap.current.setData({
        max: 5,
        data: gazePoints.current
      });
      
      const heatmapContainer = document.getElementById('heatmapContainer');
      if (heatmapContainer) {
        heatmapContainer.style.display = 'block';
      }
    }

    setStatus('Seguimiento detenido - Mapa de calor visible');
    showNotification('Mapa de calor generado!');
  };

  const startCalibration = () => {
    if (!isTracking || isCalibrating) return;
    
    setIsCalibrating(true);
    setCalibrationStep(0);
    document.body.classList.add('calibration-active');
    showNextCalibrationPoint();
  };

  const showNextCalibrationPoint = () => {
    if (calibrationStep >= calibrationPoints.length) {
      finishCalibration();
      return;
    }

    const point = calibrationPoints[calibrationStep];
    setCalibrationPoint({ x: point.x - 10, y: point.y - 10, visible: true });
    setStatus(`Calibración: Paso ${calibrationStep + 1} de ${calibrationPoints.length} - Mire al punto naranja`);

    setTimeout(() => {
      if (window.webgazer) {
        window.webgazer.addCalibrationPoint(point.x, point.y);
      }
      
      setCalibrationPoint(prev => ({ ...prev, visible: false }));
      setCalibrationStep(prev => prev + 1);
      
      setTimeout(showNextCalibrationPoint, 300);
    }, 2000);
  };

  const finishCalibration = () => {
    setIsCalibrating(false);
    document.body.classList.remove('calibration-active');
    setStatus('Calibración completada! Seguimiento más preciso');
    
    if (window.webgazer) {
      window.webgazer.setGazeListener((data: any) => {
        if (!isTracking || !data || isCalibrating) return;
        
        if (data.x < 0 || data.y < 0 || data.x > window.innerWidth || data.y > window.innerHeight) return;
        
        const now = Date.now();
        if (now - lastGazeTime.current < 50) return;
        lastGazeTime.current = now;
        
        setGazePosition({ x: data.x, y: data.y, visible: true });
        
        const point = { x: data.x, y: data.y, value: 1 };
        gazePoints.current.push(point);
        
        if (heatmap.current) {
          heatmap.current.addData(point);
        }
      });
    }
    
    showNotification('Calibración completada con éxito!');
  };

  useEffect(() => {
    const initializeWebGazer = () => {
      if (!window.webgazer || !window.h337) {
        setTimeout(initializeWebGazer, 100);
        return;
      }

      initHeatmap();
      
      window.webgazer
        .setRegression('ridge')
        .setTracker('clmtrackr')
        .setGazeListener(() => {})
        .begin();
      
      window.webgazer.showVideoPreview(true).showPredictionPoints(true);
      const videoContainer = document.getElementById('videoContainer');
      if (videoContainer) {
        videoContainer.style.display = 'none';
      }
      
      window.saveDataAcrossSessions = false;
    };

    initializeWebGazer();

    const handleClickOutside = (e: MouseEvent) => {
      const panel = document.getElementById('tracking-panel');
      const toggle = document.getElementById('eye-toggle-btn');
      
      if (panel && toggle && !panel.contains(e.target as Node) && !toggle.contains(e.target as Node)) {
        setIsPanelOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    updateHeatmapConfig();
  }, [radius, opacity]);

  return (
    <>
      {/* Eye Tracking Controls */}
      <div className="fixed bottom-5 right-5 z-[1001]">
        <div
          id="eye-toggle-btn"
          className="w-12 h-12 rounded-full bg-[#FF8C42] flex items-center justify-center cursor-pointer shadow-lg transition-transform hover:scale-110 z-[1002]"
          onClick={(e) => {
            e.stopPropagation();
            setIsPanelOpen(!isPanelOpen);
          }}
          aria-label="Controles de seguimiento ocular"
        >
          <i className="fas fa-eye text-xl text-black"></i>
        </div>

        {isPanelOpen && (
          <Card
            id="tracking-panel"
            className="absolute bottom-[60px] right-0 bg-[rgba(25,25,35,0.95)] border-gray-700 rounded-lg p-4 w-56 shadow-xl z-[1001]"
          >
            <div className="space-y-2">
              <Button
                onClick={startTracking}
                disabled={isTracking}
                className="w-full justify-start bg-[#333348] hover:bg-[#3d3d5a] text-white text-sm"
              >
                <i className="fas fa-play mr-2"></i> Iniciar seguimiento
              </Button>
              
              <Button
                onClick={startCalibration}
                disabled={!isTracking || isCalibrating}
                className="w-full justify-start bg-[#333348] hover:bg-[#3d3d5a] text-white text-sm"
              >
                <i className="fas fa-crosshairs mr-2"></i> Calibrar
              </Button>
              
              <Button
                onClick={stopTracking}
                disabled={!isTracking}
                className="w-full justify-start bg-[#d14343] hover:bg-[#b52e2e] text-white text-sm"
              >
                <i className="fas fa-stop mr-2"></i> Detener seguimiento
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-gray-300">Tamaño:</label>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-300">Opacidad:</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-3 bg-[rgba(255,255,255,0.1)] text-gray-300 p-2 rounded text-xs text-center">
              {status}
            </div>
          </Card>
        )}
      </div>

      {/* Video Container */}
      <div
        id="videoContainer"
        className="fixed bottom-5 left-5 w-45 z-[1001] bg-black/70 rounded-lg overflow-hidden shadow-lg"
        style={{ display: 'none' }}
      >
        <video
          id="webgazerVideoFeed"
          width="180"
          autoPlay
          muted
          playsInline
          className="w-full"
        />
      </div>

      {/* Heatmap Container */}
      <div
        id="heatmapContainer"
        className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-[1000]"
        style={{ display: 'none' }}
      />

      {/* Calibration Point */}
      {calibrationPoint.visible && (
        <div
          id="calibration-point"
          className="fixed w-5 h-5 bg-[#FF8C42] rounded-full z-[1002] pointer-events-none shadow-lg"
          style={{
            left: calibrationPoint.x,
            top: calibrationPoint.y,
            boxShadow: '0 0 15px rgba(249, 115, 22, 0.8)'
          }}
        />
      )}

      {/* Gaze Dot */}
      {gazePosition.visible && (
        <div
          className="fixed w-4 h-4 bg-green-500 rounded-full z-[999] pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: gazePosition.x,
            top: gazePosition.y
          }}
        />
      )}

      {/* Notification */}
      {notification.visible && (
        <div className="fixed bottom-25 left-1/2 transform -translate-x-1/2 bg-[#FF8C42] text-black px-5 py-2 rounded shadow-lg z-[1003]">
          <i className="fas fa-info-circle mr-2"></i> {notification.text}
        </div>
      )}

      {/* Calibration Styles */}
      <style jsx global>{`
        .calibration-active {
          cursor: none !important;
        }
      `}</style>
    </>
  );
}
