#!/usr/bin/env python3
import os
from app import create_app

if __name__ == '__main__':
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    app.run(host='0.0.0.0', port=3000, debug=True)
