from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import logging
import os

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_name='development'):
    app = Flask(__name__)
    
    from app.config import config
    app.config.from_object(config.get(config_name, config['development']))
    
    # Set JWT secret key
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'dev-jwt-secret-change-in-production')
    
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://localhost:5174"])
    
    with app.app_context():
        from app.routes.auth_routes import auth_bp
        from app.routes.assets_routes import assets_bp
        from app.routes.voice_routes import voice_bp
        from app.utils.error_handler import register_error_handlers
        
        app.register_blueprint(auth_bp)
        app.register_blueprint(assets_bp)
        app.register_blueprint(voice_bp)
        register_error_handlers(app)
        
        app.logger.info('✅ Flask app initialized')
    
    return app
