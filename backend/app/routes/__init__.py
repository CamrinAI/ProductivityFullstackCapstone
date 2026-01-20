"""Initialize routes module."""
from app.routes.health_routes import health_bp
from app.routes.monitors_routes import monitors_bp
from app.routes.cars_routes import cars_bp
from app.routes.products_routes import products_bp

__all__ = ['health_bp', 'monitors_bp', 'cars_bp', 'products_bp']
