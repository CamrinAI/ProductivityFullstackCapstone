from datetime import datetime
from app import db

"""
Database models for Trade-Tracker asset management system.
Represents: Users, Assets (tools/equipment), Materials (consumables), and audit logs.
"""

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
    
    tools = db.relationship('Tool', backref='owner', cascade='all, delete-orphan', foreign_keys='Tool.user_id')
    materials = db.relationship('Material', backref='owner', cascade='all, delete-orphan', foreign_keys='Material.user_id')
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'company': self.company,
            'role': self.role,
            'is_active': self.is_active
        }

class Tool(db.Model):
    """
    Tool model for tools and equipment tracking.
    Stores tool metadata, location, checkout status.
    """
    __tablename__ = 'tools'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    asset_type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    serial_number = db.Column(db.String(100), unique=True)
    location = db.Column(db.String(255))
    status = db.Column(db.String(50), default='available')
    checkout_date = db.Column(db.DateTime)  # When asset was last checked out
    is_available = db.Column(db.Boolean, default=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))  # Owner of the tool
    checked_out_by = db.Column(db.Integer, db.ForeignKey('users.id'))  # Track who has the tool
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships: cascade deletes logs when asset is deleted
    checkout_logs = db.relationship('CheckoutLog', backref='asset', cascade='all, delete-orphan')
    audit_logs = db.relationship('AuditLog', backref='asset', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'asset_type': self.asset_type,
            'serial_number': self.serial_number,
            'location': self.location,
            'status': self.status,
            'is_available': self.is_available,
            'checked_out_by': self.checked_out_by,
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
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
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
    CheckoutLog model for tracking tool movements.
    Records when tools are checked in/out and their locations.
    """
    __tablename__ = 'checkout_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    tool_id = db.Column(db.Integer, db.ForeignKey('tools.id'), nullable=False)
    checkout_time = db.Column(db.DateTime, default=datetime.utcnow)
    checkin_time = db.Column(db.DateTime)
    location_checkout = db.Column(db.String(255))
    location_checkin = db.Column(db.String(255))
    notes = db.Column(db.Text)

class AuditLog(db.Model):
    """
    AuditLog model for tracking tool changes and modifications.
    Maintains history of all operations performed on tools.
    """
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    tool_id = db.Column(db.Integer, db.ForeignKey('tools.id'), nullable=False)
    action = db.Column(db.String(100), nullable=False)
    details = db.Column(db.Text)
    location = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
