#!/usr/bin/env python3
"""Run the Flask development server."""
from app import create_app
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def main():
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    app.run(
        debug=os.getenv('FLASK_ENV') == 'development',
        host='0.0.0.0',
        port=int(os.getenv('FLASK_PORT', 5000))
    )

if __name__ == '__main__':
    main()
