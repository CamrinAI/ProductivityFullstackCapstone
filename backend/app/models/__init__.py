from app import db
from datetime import datetime
from enum import Enum

class User(db.Model):
    """User model for authentication and record ownership."""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    monitors = db.relationship('Monitor', backref='owner', lazy=True, cascade='all, delete-orphan')
    comparisons = db.relationship('Comparison', backref='owner', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat(),
        }


class Monitor(db.Model):
    """Monitor model for tracking service endpoints and latency."""
    __tablename__ = 'monitors'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    target_url = db.Column(db.String(500), nullable=False)
    region = db.Column(db.String(50), default='us-east')
    interval_s = db.Column(db.Integer, default=60)  # Check interval in seconds
    enabled = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    results = db.relationship('MonitorResult', backref='monitor', lazy=True, cascade='all, delete-orphan')
    
    __table_args__ = (
        db.UniqueConstraint('user_id', 'name', name='uq_user_monitor_name'),
    )
    
    def __repr__(self):
        return f'<Monitor {self.name}>'
    
    def to_dict(self, include_results=False):
        data = {
            'id': self.id,
            'name': self.name,
            'target_url': self.target_url,
            'region': self.region,
            'interval_s': self.interval_s,
            'enabled': self.enabled,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
        }
        if include_results:
            data['latest_result'] = self.get_latest_result()
        return data
    
    def get_latest_result(self):
        """Get the latest monitor result."""
        latest = MonitorResult.query.filter_by(monitor_id=self.id).order_by(
            MonitorResult.checked_at.desc()
        ).first()
        return latest.to_dict() if latest else None


class StatusTier(Enum):
    """Latency status tiers with Sonic character mapping."""
    SONIC = 'sonic'          # < 50ms: Super Fast
    KNUCKLES = 'knuckles'    # 100-300ms: Solid
    EGGMAN = 'eggman'        # > 500ms: Danger/Slow


class MonitorResult(db.Model):
    """Monitor result model for storing latency measurements."""
    __tablename__ = 'monitor_results'
    
    id = db.Column(db.Integer, primary_key=True)
    monitor_id = db.Column(db.Integer, db.ForeignKey('monitors.id'), nullable=False)
    latency_ms = db.Column(db.Float, nullable=False)
    status_tier = db.Column(db.String(20), nullable=False)  # sonic, knuckles, eggman
    checked_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    http_status = db.Column(db.Integer)  # HTTP status code or error code
    error_message = db.Column(db.String(255))
    
    def __repr__(self):
        return f'<MonitorResult {self.monitor_id} - {self.status_tier} ({self.latency_ms}ms)>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'monitor_id': self.monitor_id,
            'latency_ms': self.latency_ms,
            'status_tier': self.status_tier,
            'checked_at': self.checked_at.isoformat(),
            'http_status': self.http_status,
            'error_message': self.error_message,
        }
    
    @staticmethod
    def determine_tier(latency_ms):
        """Map latency to Sonic character tier."""
        if latency_ms < 50:
            return StatusTier.SONIC.value
        elif latency_ms < 300:
            return StatusTier.KNUCKLES.value
        else:
            return StatusTier.EGGMAN.value


class Comparison(db.Model):
    """Comparison model for car battles and product comparisons."""
    __tablename__ = 'comparisons'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    comparison_type = db.Column(db.String(50), nullable=False)  # 'car', 'product'
    item1_id = db.Column(db.String(500))  # JSON reference to item
    item2_id = db.Column(db.String(500))
    winner = db.Column(db.String(500))  # Winner data
    data_payload = db.Column(db.JSON)  # Full comparison data
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Comparison {self.comparison_type}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'comparison_type': self.comparison_type,
            'item1_id': self.item1_id,
            'item2_id': self.item2_id,
            'winner': self.winner,
            'data_payload': self.data_payload,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
        }
