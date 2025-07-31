import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import EyeTrackingControls from "@/components/EyeTrackingControls";

export default function Index() {
  return (
    <div className="min-h-screen bg-[#2a2d36] text-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-screen px-4 pt-20">
        <div className="text-center max-w-4xl mx-auto">
          <p className="text-lg md:text-xl mb-4 text-gray-300">Hola, soy</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
            <span className="text-[#FF8C42]">Matheo Santillan</span>
          </h1>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-8 text-white">
            Desarrollador de Software
          </h2>
          <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto text-gray-300 leading-relaxed">
            Este es mi portafolio y CV. Aquí puedes ver ejemplos de mis proyectos y experiencia.
          </p>
          <Button 
            className="bg-[#FF8C42] hover:bg-[#e67a37] text-black font-semibold px-8 py-6 text-lg rounded-lg"
          >
            Descargar CV
          </Button>
        </div>
      </section>

      {/* About Section with Pokemon Card */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h3 className="text-3xl md:text-4xl font-bold mb-8 text-[#FF8C42]">
                Acerca de mí
              </h3>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                Soy una persona comprometida con el aprendizaje y con una fuerte motivación por entender cómo 
                funcionan las cosas a nivel técnico. Me considero un desarrollador versátil, capaz de trabajar 
                tanto en el frontend como en el backend, siempre buscando las mejores prácticas y tecnologías 
                más actuales.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                Mi objetivo es contribuir al desarrollo de aplicaciones que generen un impacto positivo, 
                combinando creatividad y técnica para crear soluciones innovadoras y eficientes.
              </p>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <Card className="bg-gradient-to-b from-yellow-200 to-yellow-400 p-6 rounded-2xl border-4 border-yellow-600 shadow-2xl max-w-sm">
                <div className="bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-xl p-4 border-2 border-yellow-700">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xl font-bold text-black">Matheo Santillan</h4>
                    <div className="flex items-center text-black">
                      <span className="text-sm font-semibold mr-1">HP</span>
                      <span className="text-lg font-bold">200</span>
                      <span className="ml-2 text-xl">★</span>
                    </div>
                  </div>
                  <div className="bg-green-800 rounded-lg p-4 mb-4 h-48 flex items-center justify-center">
                    <div className="text-6xl">👨‍💻</div>
                  </div>
                  <div className="space-y-1 text-black text-sm">
                    <p><strong>Tipo:</strong> Desarrollador</p>
                    <p><strong>Habilidad:</strong> Full Stack</p>
                    <p><strong>Altura:</strong> 1.75m</p>
                    <p><strong>Peso:</strong> Variable</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20 px-4 bg-[#242731]">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-16 text-[#FF8C42]">
            Mis Habilidades
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-[#2a2d36] border-gray-700 p-8 hover:border-[#FF8C42] transition-colors">
              <div className="text-4xl mb-4">🧩</div>
              <h4 className="text-xl font-bold mb-4 text-white">Desarrollo orientado a objetos</h4>
              <p className="text-gray-300">
                Código modular, reutilizable y fácil de mantener.
              </p>
            </Card>
            <Card className="bg-[#2a2d36] border-gray-700 p-8 hover:border-[#FF8C42] transition-colors">
              <div className="text-4xl mb-4">🧠</div>
              <h4 className="text-xl font-bold mb-4 text-white">Lógica de programación</h4>
              <p className="text-gray-300">
                Resolver problemas con pensamiento estructurado y algoritmos eficientes.
              </p>
            </Card>
            <Card className="bg-[#2a2d36] border-gray-700 p-8 hover:border-[#FF8C42] transition-colors">
              <div className="text-4xl mb-4">🤝</div>
              <h4 className="text-xl font-bold mb-4 text-white">Colaboración en equipo</h4>
              <p className="text-gray-300">
                Trabajo conjunto con metodologías ágiles y comunicación efectiva.
              </p>
            </Card>
          </div>
          <div className="mt-12">
            <Button 
              className="bg-[#FF8C42] hover:bg-[#e67a37] text-black font-semibold px-8 py-3 rounded-lg"
            >
              Ver más de mis skills →
            </Button>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-20 px-4" id="proyectos">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold mb-16 text-center text-[#FF8C42]">
            Mis Proyectos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-[#2a2d36] border-gray-700 p-8 hover:border-[#FF8C42] transition-colors">
              <div className="text-4xl mb-4">🤖</div>
              <h4 className="text-xl font-bold mb-4 text-white">Asistente Virtual</h4>
              <p className="text-gray-300 mb-6">
                Diseñado para ayudar a personas con discapacidad visual. Usa DialogFlow, Speech API y Python.
              </p>
              <Button 
                variant="outline" 
                className="w-full border-[#FF8C42] text-[#FF8C42] hover:bg-[#FF8C42] hover:text-black"
              >
                Ver más detalles
              </Button>
            </Card>
            <Card className="bg-[#2a2d36] border-gray-700 p-8 hover:border-[#FF8C42] transition-colors">
              <div className="text-4xl mb-4">🎓</div>
              <h4 className="text-xl font-bold mb-4 text-white">Aplicación Educativa</h4>
              <p className="text-gray-300 mb-6">
                App para niños con contenidos en 3D, interacción táctil y personajes animados. Hecho en Unity.
              </p>
              <Button 
                variant="outline" 
                className="w-full border-[#FF8C42] text-[#FF8C42] hover:bg-[#FF8C42] hover:text-black"
              >
                Ver más detalles
              </Button>
            </Card>
            <Card className="bg-[#2a2d36] border-gray-700 p-8 hover:border-[#FF8C42] transition-colors">
              <div className="text-4xl mb-4">🏠</div>
              <h4 className="text-xl font-bold mb-4 text-white">Sistema de Control</h4>
              <p className="text-gray-300 mb-6">
                Plataforma IoT para manejar luces y sensores desde el móvil. Backend con Firebase y Node.js.
              </p>
              <Button 
                variant="outline" 
                className="w-full border-[#FF8C42] text-[#FF8C42] hover:bg-[#FF8C42] hover:text-black"
              >
                Ver más detalles
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-[#1a1d24] text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-[#FF8C42] rounded-full flex items-center justify-center text-2xl">
              👁️
            </div>
          </div>
          <p className="text-gray-400 text-sm">
            © 2025 Matheo Santillan — 
            <a href="mailto:matheo.santillan@uisek.edu.ec" className="text-[#FF8C42] hover:underline ml-1">
              matheo.santillan@uisek.edu.ec
            </a>
          </p>
        </div>
      </footer>

      {/* Eye Tracking Controls */}
      <EyeTrackingControls />
    </div>
  );
}
