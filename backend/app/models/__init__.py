from datetime import datetime
from enum import Enum
from app import db

class AssetStatus(Enum):
    """Asset reliability tiers - Sonic theme"""
    SONIC = "sonic"
    TAILS = "tails"
    EGGMAN = "eggman"

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    company = db.Column(db.String(255), nullable=True)
    role = db.Column(db.String(50), default='technician')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    assets = db.relationship('Asset', backref='owner', cascade='all, delete-orphan')
    materials = db.relationship('Material', backref='owner', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {'id': self.id, 'username': self.username, 'email': self.email, 'company': self.company}

class Asset(db.Model):
    __tablename__ = 'assets'
    
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    asset_type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    qr_code = db.Column(db.String(255), unique=True, nullable=False)
    location = db.Column(db.String(255))
    status = db.Column(db.String(50), default=AssetStatus.SONIC.value)
    checkout_date = db.Column(db.DateTime)
    is_available = db.Column(db.Boolean, default=True)
    last_scanned = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_status(self):
        if self.checkout_date:
            days = (datetime.utcnow() - self.checkout_date).days
            if days > 30:
                return AssetStatus.EGGMAN.value
            elif days >= 7:
                return AssetStatus.TAILS.value
            else:
                return AssetStatus.SONIC.value
        return AssetStatus.SONIC.value
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'asset_type': self.asset_type,
            'qr_code': self.qr_code,
            'location': self.location,
            'status': self.get_status(),
            'is_available': self.is_available,
            'checkout_date': self.checkout_date.isoformat() if self.checkout_date else None,
        }

class Material(db.Model):
    __tablename__ = 'materials'
    
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    unit = db.Column(db.String(50), default='box')
    quantity = db.Column(db.Integer, default=0)
    min_stock = db.Column(db.Integer, default=5)
    location = db.Column(db.String(255))
    cost_per_unit = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def needs_reorder(self):
        return self.quantity <= self.min_stock
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'unit': self.unit,
            'quantity': self.quantity,
            'min_stock': self.min_stock,
            'needs_reorder': self.needs_reorder(),
        }

class CheckoutLog(db.Model):
    __tablename__ = 'checkout_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey('assets.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    checkout_time = db.Column(db.DateTime, default=datetime.utcnow)
    checkin_time = db.Column(db.DateTime)
    location_checkout = db.Column(db.String(255))
    location_checkin = db.Column(db.String(255))
    notes = db.Column(db.Text)

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey('assets.id'), nullable=False)
    action = db.Column(db.String(100), nullable=False)
    details = db.Column(db.Text)
    location = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
