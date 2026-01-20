from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import logging

db = SQLAlchemy()

def create_app(config_name='development'):
    """Factory function to create Flask app."""
    app = Flask(__name__)
    
    # Load config
    from app.config import config
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    CORS(app, supports_credentials=True)
    
    # Set up logging
    setup_logging(app)
    
    # Register blueprints
    with app.app_context():
        from app.routes import health_bp, monitors_bp, cars_bp, products_bp
        app.register_blueprint(health_bp)
        app.register_blueprint(monitors_bp)
        app.register_blueprint(cars_bp)
        app.register_blueprint(products_bp)
        
        # Register error handlers
        from app.utils.error_handler import register_error_handlers
        register_error_handlers(app)
        
        # Create tables
        db.create_all()
    
    return app

def setup_logging(app):
    """Configure application logging."""
    if not app.debug:
        handler = logging.StreamHandler()
        handler.setLevel(logging.INFO)
        app.logger.addHandler(handler)
        app.logger.setLevel(logging.INFO)
