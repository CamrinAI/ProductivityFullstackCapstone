from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
import logging

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_name='development'):
    app = Flask(__name__)
    
    from app.config import config
    app.config.from_object(config.get(config_name, config['development']))
    
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app, supports_credentials=True)
    
    with app.app_context():
        from app.routes.assets_routes import assets_bp
        from app.routes.voice_routes import voice_bp
        from app.utils.error_handler import register_error_handlers
        
        app.register_blueprint(assets_bp)
        app.register_blueprint(voice_bp)
        register_error_handlers(app)
        
        app.logger.info('✅ Flask app initialized')
    
    return app
