from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import logging
import os

# Initialize database and migrations extensions (will be attached to app in create_app)
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app(config_name='development'):
    """
    Flask application factory.
    Initializes the Flask app with all extensions, blueprints, and configurations.
    """
    app = Flask(__name__)
    
    from app.config import config
    app.config.from_object(config.get(config_name, config['development']))
    
    # Initialize database connection, migrations, and CORS for frontend
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://localhost:5174"])
    
    # JWT error handlers
    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        return jsonify({'success': False, 'error': 'Invalid token', 'details': error_string}), 401
    
    @jwt.unauthorized_loader
    def unauthorized_callback(error_string):
        return jsonify({'success': False, 'error': 'Missing authorization token', 'details': error_string}), 401
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'success': False, 'error': 'Token has expired'}), 401
    
    # Register route blueprints: tools management and authentication
    with app.app_context():
        from app.routes.tools_routes import tools_bp
        from app.routes.auth_routes import auth_bp
        from app.utils.error_handler import register_error_handlers
        
        app.register_blueprint(tools_bp)
        app.register_blueprint(auth_bp)
        register_error_handlers(app)
        
        app.logger.info('✅ Flask app initialized')
    
    return app
