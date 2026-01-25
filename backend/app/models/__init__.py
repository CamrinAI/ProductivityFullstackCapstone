from datetime import datetime
from enum import Enum
from sqlalchemy.ext.hybrid import hybrid_property
from app import db

"""
Database models for Trade-Tracker asset management system.
Represents: Users, Assets (tools/equipment), Materials (consumables), and audit logs.
"""

class AssetStatus(Enum):
    """Asset reliability tiers based on Sonic theme - status determined by checkout duration"""
    SONIC = "sonic"   # Good condition (< 7 days checked out)
    TAILS = "tails"   # Maintenance due (7-30 days checked out)
    EGGMAN = "eggman" # Danger/missing (> 30 days checked out or unavailable)

class User(db.Model):
    """
    User model for authentication and ownership.
    Stores user credentials, company affiliation, and role.
    (Prepared for future multi-user auth implementation)
    """
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
    """
    Asset model for tools and equipment tracking.
    Stores asset metadata, location, checkout status, and generates unique QR codes.
    """
    __tablename__ = 'assets'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    asset_type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    serial_number = db.Column(db.String(100), unique=True)
    qr_code = db.Column(db.String(255), unique=True, nullable=False)  # UUID for QR scanning
    location = db.Column(db.String(255))
    status = db.Column(db.String(50), default=AssetStatus.SONIC.value)
    checkout_date = db.Column(db.DateTime)  # When asset was last checked out
    is_available = db.Column(db.Boolean, default=True)
    last_scanned = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships: cascade deletes logs when asset is deleted
    checkout_logs = db.relationship('CheckoutLog', backref='asset', cascade='all, delete-orphan')
    audit_logs = db.relationship('AuditLog', backref='asset', cascade='all, delete-orphan')
    
    @hybrid_property
    def status_tier(self):
        """
        Calculate asset status tier based on availability and checkout duration.
        Returns SONIC (good) -> TAILS (maintenance) -> EGGMAN (danger) based on time.
        """
        if self.is_available is False:
            return AssetStatus.EGGMAN.value
        if not self.checkout_date:
            return AssetStatus.SONIC.value
        days = (datetime.utcnow() - self.checkout_date).days
        if days < 7:
            return AssetStatus.SONIC.value
        if days < 30:
            return AssetStatus.TAILS.value
        return AssetStatus.EGGMAN.value
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'asset_type': self.asset_type,
            'serial_number': self.serial_number,
            'qr_code': self.qr_code,
            'location': self.location,
            'status': self.status_tier,
            'is_available': self.is_available,
            'checkout_date': self.checkout_date.isoformat() if self.checkout_date else None,
        }

class Material(db.Model):
    """
    Material model for tracking consumables (wire, fasteners, etc).
    Tracks quantity and reorder thresholds for inventory management.
    """
    __tablename__ = 'materials'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    unit = db.Column(db.String(50), default='box')
    quantity = db.Column(db.Integer, default=0)
    min_stock = db.Column(db.Integer, default=5)
    location = db.Column(db.String(255))
    cost_per_unit = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def needs_reorder(self):
        """Check if material quantity is at or below minimum stock threshold"""
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
    """
    CheckoutLog model for tracking asset movements.
    Records when assets are checked in/out and their locations.
    """
    __tablename__ = 'checkout_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey('assets.id'), nullable=False)
    checkout_time = db.Column(db.DateTime, default=datetime.utcnow)
    checkin_time = db.Column(db.DateTime)
    location_checkout = db.Column(db.String(255))
    location_checkin = db.Column(db.String(255))
    notes = db.Column(db.Text)

class AuditLog(db.Model):
    """
    AuditLog model for tracking asset changes and modifications.
    Maintains history of all operations performed on assets.
    """
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey('assets.id'), nullable=False)
    action = db.Column(db.String(100), nullable=False)
    details = db.Column(db.Text)
    location = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
