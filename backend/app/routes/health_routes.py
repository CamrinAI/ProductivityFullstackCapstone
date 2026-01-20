"""Health and status routes."""
from flask import Blueprint, jsonify

health_bp = Blueprint('health', __name__, url_prefix='/api')

@health_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'Sonic Speedometer & Market Battle Engine'
    }), 200

@health_bp.route('/status', methods=['GET'])
def status():
    """Service status endpoint."""
    return jsonify({
        'status': 'operational',
        'version': '1.0.0',
        'features': {
            'monitoring': 'enabled',
            'car_battles': 'enabled',
            'merchant_comparison': 'pending',
        }
    }), 200
