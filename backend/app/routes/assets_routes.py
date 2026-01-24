from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models import User, Asset, Material, CheckoutLog, AuditLog, AssetStatus
from app.utils.error_handler import APIError, ValidationError
from datetime import datetime
import uuid
import qrcode
from io import BytesIO

assets_bp = Blueprint('assets', __name__, url_prefix='/api/assets')

def get_user():
    # Require header-based identity; optional bearer token enforcement if configured
    auth_header = request.headers.get('Authorization', '')
    bearer_token = current_app.config.get('API_BEARER_TOKEN')
    if bearer_token:
        if not auth_header.startswith('Bearer '):
            raise APIError("Unauthorized", 401)
        token = auth_header.split(' ', 1)[1].strip()
        if token != bearer_token:
            raise APIError("Unauthorized", 401)

    user_id = request.headers.get('X-User-ID')
    if not user_id:
        raise ValidationError("User ID header required")
    user = User.query.get(int(user_id))
    if not user:
        raise APIError("User not found", 404)
    return user

@assets_bp.route('', methods=['GET'])
def list_assets():
    user = get_user()
    assets = Asset.query.filter_by(owner_id=user.id).all()
    return jsonify({'success': True, 'assets': [a.to_dict() for a in assets]}), 200

@assets_bp.route('', methods=['POST'])
def create_asset():
    user = get_user()
    data = request.get_json()
    if not data or not data.get('name'):
        raise ValidationError("name required")
    serial_number = data.get('serial_number')
    if serial_number:
        existing = Asset.query.filter_by(serial_number=serial_number).first()
        if existing:
            raise ValidationError("serial_number already exists")
    
    asset = Asset(
        owner_id=user.id,
        name=data['name'],
        asset_type=data.get('asset_type', 'equipment'),
        description=data.get('description'),
        serial_number=serial_number,
        qr_code=str(uuid.uuid4()),
        location=data.get('location'),
        is_available=True
    )
    db.session.add(asset)
    db.session.commit()
    return jsonify({'success': True, 'asset': asset.to_dict()}), 201

@assets_bp.route('/<int:asset_id>/checkout', methods=['POST'])
def checkout_asset(asset_id):
    user = get_user()
    asset = Asset.query.filter_by(id=asset_id, owner_id=user.id).first()
    if not asset:
        raise APIError("Asset not found", 404)
    
    data = request.get_json() or {}
    checkout = CheckoutLog(
        asset_id=asset.id,
        user_id=user.id,
        location_checkout=data.get('location', 'unknown')
    )
    asset.is_available = False
    asset.checkout_date = datetime.utcnow()
    asset.location = data.get('location', 'unknown')
    
    db.session.add(checkout)
    db.session.commit()
    return jsonify({'success': True, 'asset': asset.to_dict()}), 200

@assets_bp.route('/<int:asset_id>/checkin', methods=['POST'])
def checkin_asset(asset_id):
    user = get_user()
    asset = Asset.query.filter_by(id=asset_id, owner_id=user.id).first()
    if not asset:
        raise APIError("Asset not found", 404)
    
    data = request.get_json() or {}
    checkout = CheckoutLog.query.filter_by(asset_id=asset.id, checkin_time=None).first()
    if checkout:
        checkout.checkin_time = datetime.utcnow()
        checkout.location_checkin = data.get('location', 'warehouse')
    
    asset.is_available = True
    asset.checkout_date = None
    asset.location = data.get('location', 'warehouse')
    db.session.commit()
    return jsonify({'success': True, 'asset': asset.to_dict()}), 200

@assets_bp.route('/<int:asset_id>/qr', methods=['GET'])
def generate_qr(asset_id):
    user = get_user()
    asset = Asset.query.filter_by(id=asset_id, owner_id=user.id).first()
    if not asset:
        raise APIError("Asset not found", 404)
    
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(asset.qr_code)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img_io = BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    
    from flask import send_file
    return send_file(img_io, mimetype='image/png', as_attachment=True, download_name=f'asset_{asset.id}_qr.png')

@assets_bp.route('/<int:asset_id>/serial', methods=['POST'])
def update_serial(asset_id):
    user = get_user()
    asset = Asset.query.filter_by(id=asset_id, owner_id=user.id).first()
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

@assets_bp.route('/materials', methods=['GET'])
def list_materials():
    user = get_user()
    materials = Material.query.filter_by(owner_id=user.id).all()
    return jsonify({'success': True, 'materials': [m.to_dict() for m in materials]}), 200

@assets_bp.route('/materials', methods=['POST'])
def create_material():
    user = get_user()
    data = request.get_json()
    if not data or not data.get('name'):
        raise ValidationError("name required")
    
    material = Material(
        owner_id=user.id,
        name=data['name'],
        unit=data.get('unit', 'box'),
        quantity=data.get('quantity', 0),
        min_stock=data.get('min_stock', 5)
    )
    db.session.add(material)
    db.session.commit()
    return jsonify({'success': True, 'material': material.to_dict()}), 201
