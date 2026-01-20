"""Product and merchant comparison routes."""
from flask import Blueprint, request, jsonify, session
from app.services import MerchantCenterService
from app.utils.error_handler import ValidationError, UnauthorizedError

products_bp = Blueprint('products', __name__, url_prefix='/api/products')

def require_auth():
    """Verify user is authenticated."""
    if 'user_id' not in session:
        raise UnauthorizedError("Authentication required")
    return session['user_id']

@products_bp.route('/search', methods=['GET'])
def search_products():
    """Search for products."""
    require_auth()
    
    query = request.args.get('q', '')
    limit = request.args.get('limit', 10, type=int)
    
    if not query:
        raise ValidationError("Query parameter 'q' is required")
    
    results = MerchantCenterService.search_products(query, limit)
    
    return jsonify({
        'data': results['products'],
        'query': query,
        'count': results['count'],
    }), 200

@products_bp.route('/<product_id>', methods=['GET'])
def get_product(product_id):
    """Get a specific product."""
    require_auth()
    
    # Placeholder implementation
    return jsonify({
        'data': {
            'id': product_id,
            'message': 'Product details endpoint'
        }
    }), 200

@products_bp.route('/compare', methods=['POST'])
def compare_products():
    """Compare multiple products."""
    require_auth()
    
    data = request.get_json()
    
    if not data or 'product_ids' not in data:
        raise ValidationError("Missing required field: product_ids")
    
    product_ids = data['product_ids']
    
    if not isinstance(product_ids, list) or len(product_ids) < 2:
        raise ValidationError("At least 2 product IDs required for comparison")
    
    result = MerchantCenterService.compare_products(product_ids)
    
    return jsonify({
        'message': 'Product comparison completed',
        'data': result,
    }), 200
