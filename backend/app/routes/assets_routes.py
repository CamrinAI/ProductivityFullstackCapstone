from flask import Blueprint, request, jsonify
from app import db
from app.models import Asset, Material, CheckoutLog, AuditLog
from app.utils.error_handler import APIError, ValidationError
from datetime import datetime

"""
Asset Management Routes
Handles CRUD operations for assets and materials, checkout/checkin tracking.
All endpoints are open (no auth required for MVP) to allow public asset tracking.
"""

assets_bp = Blueprint('assets', __name__, url_prefix='/api/assets')

# ========== ASSET CRUD ENDPOINTS ==========

@assets_bp.route('', methods=['GET'])
def list_assets():
    """Fetch all assets with pagination support."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    pagination = Asset.query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        'success': True,
        'assets': [a.to_dict() for a in pagination.items],
        'total': pagination.total,
        'page': pagination.page,
        'pages': pagination.pages,
        'per_page': pagination.per_page
    }), 200

@assets_bp.route('/<int:asset_id>', methods=['GET'])
def get_asset(asset_id):
    """Retrieve a single asset by ID with computed status tier."""
    asset = Asset.query.get(asset_id)
    if not asset:
        raise APIError("Asset not found", 404)
    return jsonify({'success': True, 'asset': asset.to_dict()}), 200

@assets_bp.route('', methods=['POST'])
def create_asset():
    """Create a new asset with unique QR code UUID and optional serial number."""
    data = request.get_json()
    if not data or not data.get('name'):
        raise ValidationError("name required")
    
    # Validate serial number uniqueness if provided
    serial_number = data.get('serial_number')
    if serial_number:
        existing = Asset.query.filter_by(serial_number=serial_number).first()
        if existing:
            raise ValidationError("serial_number already exists")
    
    # Create asset
    asset = Asset(
        name=data['name'],
        asset_type=data.get('asset_type', 'equipment'),
        description=data.get('description'),
        serial_number=serial_number,
        location=data.get('location'),
        is_available=True,
        status='available'
    )
    db.session.add(asset)
    db.session.commit()
    return jsonify({'success': True, 'asset': asset.to_dict()}), 201

@assets_bp.route('/<int:asset_id>', methods=['PUT'])
def update_asset(asset_id):
    """Update asset fields (name, location, description). Serial number updates use separate endpoint."""
    asset = Asset.query.get(asset_id)
    if not asset:
        raise APIError("Asset not found", 404)
    
    data = request.get_json() or {}
    
    # Update permitted fields
    if 'name' in data:
        asset.name = data['name']
    if 'location' in data:
        asset.location = data['location']
    if 'description' in data:
        asset.description = data['description']
    
    db.session.commit()
    return jsonify({'success': True, 'asset': asset.to_dict()}), 200

@assets_bp.route('/<int:asset_id>', methods=['DELETE'])
def delete_asset(asset_id):
    """Delete asset and cascade-delete all related checkout logs and audit logs."""
    asset = Asset.query.get(asset_id)
    if not asset:
        raise APIError("Asset not found", 404)
    db.session.delete(asset)
    db.session.commit()
    return jsonify({'success': True}), 200

# ========== ASSET CHECKOUT/CHECKIN TRACKING ==========

@assets_bp.route('/<int:asset_id>/checkout', methods=['POST'])
def checkout_asset(asset_id):
    """Check out an asset: mark unavailable, record location, and log the checkout time."""
    asset = Asset.query.get(asset_id)
    if not asset:
        raise APIError("Asset not found", 404)
    
    data = request.get_json() or {}
    # Create checkout log entry for audit trail
    checkout = CheckoutLog(
        asset_id=asset.id,
        location_checkout=data.get('location', 'unknown')
    )
    # Update asset status
    asset.is_available = False
    asset.checkout_date = datetime.utcnow()
    asset.location = data.get('location', 'unknown')
    
    db.session.add(checkout)
    db.session.commit()
    return jsonify({'success': True, 'asset': asset.to_dict()}), 200

@assets_bp.route('/<int:asset_id>/checkin', methods=['POST'])
def checkin_asset(asset_id):
    """Check in an asset: mark available, clear checkout date, and close the checkout log entry."""
    asset = Asset.query.get(asset_id)
    if not asset:
        raise APIError("Asset not found", 404)
    
    data = request.get_json() or {}
    # Find the open checkout log and close it
    checkout = CheckoutLog.query.filter_by(asset_id=asset.id, checkin_time=None).first()
    if checkout:
        checkout.checkin_time = datetime.utcnow()
        checkout.location_checkin = data.get('location', 'warehouse')
    
    # Update asset status
    asset.is_available = True
    asset.checkout_date = None
    asset.location = data.get('location', 'warehouse')
    db.session.commit()
    return jsonify({'success': True, 'asset': asset.to_dict()}), 200

# ========== SERIAL NUMBER MANAGEMENT ==========

@assets_bp.route('/<int:asset_id>/serial', methods=['POST'])
def update_serial(asset_id):
    """Update asset serial number. Serial numbers must be unique across all assets."""
    asset = Asset.query.get(asset_id)
    if not asset:
        raise APIError("Asset not found", 404)

    data = request.get_json() or {}
    serial = data.get('serial_number')
    if not serial:
        raise ValidationError("serial_number required")

    conflict = Asset.query.filter(Asset.serial_number == serial, Asset.id != asset.id).first()
    if conflict:
        raise ValidationError("serial_number already exists")

    asset.serial_number = serial
    db.session.commit()
    return jsonify({'success': True, 'asset': asset.to_dict()}), 200

# ========== MATERIAL INVENTORY MANAGEMENT ==========

@assets_bp.route('/materials', methods=['GET'])
def list_materials():
    """Fetch all materials (consumables) tracked in inventory."""
    materials = Material.query.all()
    return jsonify({'success': True, 'materials': [m.to_dict() for m in materials]}), 200

@assets_bp.route('/materials', methods=['POST'])
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

@assets_bp.route('/materials/<int:material_id>', methods=['PUT'])
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

@assets_bp.route('/materials/<int:material_id>', methods=['DELETE'])
def delete_material(material_id):
    """Delete a material from inventory."""
    material = Material.query.get(material_id)
    if not material:
        raise APIError("Material not found", 404)
    db.session.delete(material)
    db.session.commit()
    return jsonify({'success': True}), 200
