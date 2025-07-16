# AplicacionDeSpeedrunConAI

Proyecto de speedrun automatizado con IA integrada en Godot Engine usando aprendizaje por refuerzo.

## 🔧 Configuración del entorno de desarrollo

### Herramientas obligatorias
1. **Godot Engine 4.2+**  
   [Descargar última versión](https://godotengine.org/download)
2. **Python 3.10+**  
   [Instalación con pyenv (recomendado)](https://github.com/pyenv/pyenv)
3. **Git**  
   [Guía de instalación](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
4. **Entorno de desarrollo**:
   - Visual Studio Code [Descargar](https://code.visualstudio.com/)
     - Extensiones recomendadas:
       - [Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python)
       - [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)
       - [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
   - PyCharm [Alternativa](https://www.jetbrains.com/pycharm/)

### ⚙️ Configuración paso a paso
```bash
# 1. Clonar repositorio
git clone https://github.com/MathSantill/AplicacionDeSpeedrunConAI.git
cd AplicacionDeSpeedrunConAI

# 2. Crear entorno virtual Python
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows (PowerShell)

# 3. Instalar dependencias Python
pip install stable-baselines3 flask fastapi uvicorn requests

# 4. Iniciar servidor API
uvicorn api:app --reload --port 5000

# 5. Abrir proyecto en Godot:
#   - Iniciar Godot Engine
#   - Seleccionar "Importar" -> Buscar archivo "project.godot"
#   - Ejecutar escena principal (Main.tscn)