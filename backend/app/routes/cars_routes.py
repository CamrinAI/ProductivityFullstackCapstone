"""Car battle routes."""
from flask import Blueprint, request, jsonify, session
from app.services import CarBattleService
from app.utils.error_handler import ValidationError, UnauthorizedError
from app import db
from app.models import Comparison

cars_bp = Blueprint('cars', __name__, url_prefix='/api/cars')

def require_auth():
    """Verify user is authenticated."""
    if 'user_id' not in session:
        raise UnauthorizedError("Authentication required")
    return session['user_id']

@cars_bp.route('/compare', methods=['POST'])
def compare_cars():
    """
    Run a head-to-head car battle.
    
    Expected JSON:
    {
        "car1": {"make": "Chevrolet", "model": "Corvette", "year": 2023},
        "car2": {"make": "Ford", "model": "Mustang", "year": 2023},
        "zip_code": "75146"
    }
    """
    user_id = require_auth()
    
    data = request.get_json()
    
    if not data or 'car1' not in data or 'car2' not in data:
        raise ValidationError("Missing required fields: car1, car2")
    
    car1 = data['car1']
    car2 = data['car2']
    
    if not all(k in car1 for k in ['make', 'model', 'year']):
        raise ValidationError("car1 missing required fields: make, model, year")
    
    if not all(k in car2 for k in ['make', 'model', 'year']):
        raise ValidationError("car2 missing required fields: make, model, year")
    
    zip_code = data.get('zip_code', '75146')
    
    # Run the battle
    battle_result = CarBattleService.compare_cars(
        car1['make'], car1['model'], car1['year'],
        car2['make'], car2['model'], car2['year'],
        zip_code
    )
    
    # Save comparison to database
    comparison = Comparison(
        user_id=user_id,
        comparison_type='car',
        item1_id=f"{car1['make']} {car1['model']} {car1['year']}",
        item2_id=f"{car2['make']} {car2['model']} {car2['year']}",
        winner=battle_result['winner']['car'],
        data_payload=battle_result,
    )
    
    db.session.add(comparison)
    db.session.commit()
    
    return jsonify({
        'message': 'Car battle completed',
        'data': battle_result,
        'comparison_id': comparison.id,
    }), 200

@cars_bp.route('/comparisons', methods=['GET'])
def get_comparisons():
    """Get all car comparisons for the current user."""
    user_id = require_auth()
    
    comparisons = Comparison.query.filter_by(
        user_id=user_id,
        comparison_type='car'
    ).order_by(Comparison.created_at.desc()).all()
    
    return jsonify({
        'data': [c.to_dict() for c in comparisons],
        'count': len(comparisons),
    }), 200
