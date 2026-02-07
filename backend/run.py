#!/usr/bin/env python3
import os
from app import create_app, db

if __name__ == '__main__':
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    
    # Create database tables if they don't exist
    with app.app_context():
        db.create_all()
        app.logger.info('✅ Database tables created')
    
    app.run(host='0.0.0.0', port=3000, debug=True)
