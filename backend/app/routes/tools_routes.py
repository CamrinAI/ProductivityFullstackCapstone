from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Tool, Material, CheckoutLog, AuditLog, User
from app.utils.error_handler import APIError, ValidationError
from datetime import datetime

"""
Tool Management Routes
Handles CRUD operations for tools and materials, checkout/checkin tracking.
Role-based access:
- Technicians: Can view tools and check out/in
- Foremen: Can manage tools (create, update, delete)
- Superintendents: Full access including material management
"""

tools_bp = Blueprint('tools', __name__, url_prefix='/api/tools')

def get_current_user():
    """Helper to get current user from JWT token."""
    try:
        user_id = get_jwt_identity()
        return User.query.get(user_id)
    except:
        return None

def require_role(allowed_roles):
    """Decorator to check if user has required role."""
    def decorator(f):
        def wrapper(*args, **kwargs):
            user = get_current_user()
            if not user:
                raise APIError("Authentication required", 401)
            if user.role not in allowed_roles:
                raise APIError(f"Access denied. Required role: {', '.join(allowed_roles)}", 403)
            return f(*args, **kwargs)
        wrapper.__name__ = f.__name__
        return wrapper
    return decorator

# ========== TOOL CRUD ENDPOINTS ==========

@tools_bp.route('', methods=['GET'])
def list_tools():
    """Fetch all tools with pagination support."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    pagination = Tool.query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        'success': True,
        'tools': [t.to_dict() for t in pagination.items],
        'total': pagination.total,
        'page': pagination.page,
        'pages': pagination.pages,
        'per_page': pagination.per_page
    }), 200

@tools_bp.route('/<int:tool_id>', methods=['GET'])
def get_tool(tool_id):
    """Retrieve a single tool by ID."""
    tool = Tool.query.get(tool_id)
    if not tool:
        raise APIError("Tool not found", 404)
    return jsonify({'success': True, 'tool': tool.to_dict()}), 200

@tools_bp.route('', methods=['POST'])
@jwt_required()
@require_role(['foreman', 'superintendent'])
def create_tool():
    """Create a new tool with optional serial number. (Foreman/Superintendent only)"""
    data = request.get_json()
    if not data or not data.get('name'):
        raise ValidationError("name required")
    
    # Validate serial number uniqueness if provided
    serial_number = data.get('serial_number')
    if serial_number:
        existing = Tool.query.filter_by(serial_number=serial_number).first()
        if existing:
            raise ValidationError("serial_number already exists")
    
    # Create tool
    tool = Tool(
        name=data['name'],
        asset_type=data.get('asset_type', 'equipment'),
        description=data.get('description'),
        serial_number=serial_number,
        location=data.get('location'),
        is_available=True,
        status='available'
    )
    db.session.add(tool)
    db.session.commit()
    return jsonify({'success': True, 'tool': tool.to_dict()}), 201

@tools_bp.route('/<int:tool_id>', methods=['PUT'])
def update_tool(tool_id):
    """Update tool fields (name, location, description). Serial number updates use separate endpoint."""
    tool = Tool.query.get(tool_id)
    if not tool:
        raise APIError("Tool not found", 404)
    
    data = request.get_json() or {}
    
    # Update permitted fields
    if 'name' in data:
        tool.name = data['name']
    if 'location' in data:
        tool.location = data['location']
    if 'description' in data:
        tool.description = data['description']
    
    db.session.commit()
    return jsonify({'success': True, 'tool': tool.to_dict()}), 200

@tools_bp.route('/<int:tool_id>', methods=['DELETE'])
def delete_tool(tool_id):
    """Delete tool and cascade-delete all related checkout logs and audit logs."""
    tool = Tool.query.get(tool_id)
    if not tool:
        raise APIError("Tool not found", 404)
    db.session.delete(tool)
    db.session.commit()
    return jsonify({'success': True}), 200

# ========== TOOL CHECKOUT/CHECKIN TRACKING ==========

@tools_bp.route('/<int:tool_id>/checkout', methods=['POST'])
def checkout_tool(tool_id):
    """Check out a tool: mark unavailable, record location, and log the checkout time."""
    tool = Tool.query.get(tool_id)
    if not tool:
        raise APIError("Tool not found", 404)
    
    data = request.get_json() or {}
    # Create checkout log entry for audit trail
    checkout = CheckoutLog(
        tool_id=tool.id,
        location_checkout=data.get('location', 'unknown')
    )
    # Update tool status
    tool.is_available = False
    tool.checkout_date = datetime.utcnow()
    tool.location = data.get('location', 'unknown')
    
    db.session.add(checkout)
    db.session.commit()
    return jsonify({'success': True, 'tool': tool.to_dict()}), 200

@tools_bp.route('/<int:tool_id>/checkin', methods=['POST'])
def checkin_tool(tool_id):
    """Check in a tool: mark available, clear checkout date, and close the checkout log entry."""
    tool = Tool.query.get(tool_id)
    if not tool:
        raise APIError("Tool not found", 404)
    
    data = request.get_json() or {}
    # Find the open checkout log and close it
    checkout = CheckoutLog.query.filter_by(tool_id=tool.id, checkin_time=None).first()
    if checkout:
        checkout.checkin_time = datetime.utcnow()
        checkout.location_checkin = data.get('location', 'warehouse')
    
    # Update tool status
    tool.is_available = True
    tool.checkout_date = None
    tool.location = data.get('location', 'warehouse')
    db.session.commit()
    return jsonify({'success': True, 'tool': tool.to_dict()}), 200

# ========== SERIAL NUMBER MANAGEMENT ==========

@tools_bp.route('/<int:tool_id>/serial', methods=['POST'])
def update_serial(tool_id):
    """Update tool serial number. Serial numbers must be unique across all tools."""
    tool = Tool.query.get(tool_id)
    if not tool:
        raise APIError("Tool not found", 404)

    data = request.get_json() or {}
    serial = data.get('serial_number')
    if not serial:
        raise ValidationError("serial_number required")

    conflict = Tool.query.filter(Tool.serial_number == serial, Tool.id != tool.id).first()
    if conflict:
        raise ValidationError("serial_number already exists")

    tool.serial_number = serial
    db.session.commit()
    return jsonify({'success': True, 'tool': tool.to_dict()}), 200

# ========== MATERIAL INVENTORY MANAGEMENT ==========

@tools_bp.route('/materials', methods=['GET'])
def list_materials():
    """Fetch all materials (consumables) tracked in inventory."""
    materials = Material.query.all()
    return jsonify({'success': True, 'materials': [m.to_dict() for m in materials]}), 200

@tools_bp.route('/materials', methods=['POST'])
def create_material():
    """Create a new material with quantity and reorder threshold."""
    data = request.get_json()
    if not data or not data.get('name'):
        raise ValidationError("name required")
    
    material = Material(
        name=data['name'],
        unit=data.get('unit', 'box'),
        quantity=data.get('quantity', 0),
        min_stock=data.get('min_stock', 5)
    )
    db.session.add(material)
    db.session.commit()
    return jsonify({'success': True, 'material': material.to_dict()}), 201

@tools_bp.route('/materials/<int:material_id>', methods=['PUT'])
def update_material(material_id):
    """Update material attributes: name, unit, quantity, and reorder threshold."""
    material = Material.query.get(material_id)
    if not material:
        raise APIError("Material not found", 404)
    data = request.get_json() or {}
    
    if 'name' in data:
        material.name = data['name']
    if 'unit' in data:
        material.unit = data['unit']
    if 'quantity' in data:
        material.quantity = int(data['quantity'])
    if 'min_stock' in data:
        material.min_stock = int(data['min_stock'])
    
    db.session.commit()
    return jsonify({'success': True, 'material': material.to_dict()}), 200

@tools_bp.route('/materials/<int:material_id>', methods=['DELETE'])
def delete_material(material_id):
    """Delete a material from inventory."""
    material = Material.query.get(material_id)
    if not material:
        raise APIError("Material not found", 404)
    db.session.delete(material)
    db.session.commit()
    return jsonify({'success': True}), 200
