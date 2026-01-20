"""Flask application entry point."""
from app import create_app
import os

def run():
    """Run the Flask application."""
    env = os.getenv('FLASK_ENV', 'development')
    app = create_app(env)
    
    if env == 'development':
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        app.run(host='0.0.0.0', port=5000)

if __name__ == '__main__':
    run()
