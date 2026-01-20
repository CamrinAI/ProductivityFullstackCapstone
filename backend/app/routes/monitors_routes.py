"""Monitor management routes for latency speedometer."""
from flask import Blueprint, request, jsonify, session
from app import db
from app.models import Monitor, MonitorResult, User
from app.services import MonitorService
from app.utils.error_handler import NotFoundError, ForbiddenError, ValidationError, UnauthorizedError
import asyncio

monitors_bp = Blueprint('monitors', __name__, url_prefix='/api/monitors')

# Helper function to ensure authentication
def require_auth():
    """Verify user is authenticated."""
    if 'user_id' not in session:
        raise UnauthorizedError("Authentication required")
    return session['user_id']

# Helper function to check ownership
def check_monitor_ownership(monitor, user_id):
    """Verify user owns the monitor."""
    if monitor.user_id != user_id:
        raise ForbiddenError("You do not have permission to access this monitor")

@monitors_bp.route('', methods=['GET'])
def list_monitors():
    """List all monitors for the current user."""
    user_id = require_auth()
    
    monitors = Monitor.query.filter_by(user_id=user_id).all()
    
    return jsonify({
        'data': [m.to_dict(include_results=True) for m in monitors],
        'count': len(monitors)
    }), 200

@monitors_bp.route('', methods=['POST'])
def create_monitor():
    """Create a new monitor."""
    user_id = require_auth()
    
    data = request.get_json()
    
    # Validation
    if not data or 'name' not in data or 'target_url' not in data:
        raise ValidationError("Missing required fields: name, target_url")
    
    # Check for duplicate monitor name
    existing = Monitor.query.filter_by(user_id=user_id, name=data['name']).first()
    if existing:
        raise ValidationError(f"Monitor with name '{data['name']}' already exists")
    
    monitor = Monitor(
        user_id=user_id,
        name=data['name'],
        target_url=data['target_url'],
        region=data.get('region', 'us-east'),
        interval_s=data.get('interval_s', 60),
        enabled=data.get('enabled', True),
    )
    
    db.session.add(monitor)
    db.session.commit()
    
    return jsonify({
        'message': 'Monitor created successfully',
        'data': monitor.to_dict()
    }), 201

@monitors_bp.route('/<int:monitor_id>', methods=['GET'])
def get_monitor(monitor_id):
    """Get a specific monitor."""
    user_id = require_auth()
    
    monitor = Monitor.query.get(monitor_id)
    if not monitor:
        raise NotFoundError(f"Monitor with ID {monitor_id} not found")
    
    check_monitor_ownership(monitor, user_id)
    
    return jsonify({
        'data': monitor.to_dict(include_results=True)
    }), 200

@monitors_bp.route('/<int:monitor_id>', methods=['PUT'])
def update_monitor(monitor_id):
    """Update a monitor."""
    user_id = require_auth()
    
    monitor = Monitor.query.get(monitor_id)
    if not monitor:
        raise NotFoundError(f"Monitor with ID {monitor_id} not found")
    
    check_monitor_ownership(monitor, user_id)
    
    data = request.get_json()
    
    if 'name' in data:
        monitor.name = data['name']
    if 'target_url' in data:
        monitor.target_url = data['target_url']
    if 'region' in data:
        monitor.region = data['region']
    if 'interval_s' in data:
        monitor.interval_s = data['interval_s']
    if 'enabled' in data:
        monitor.enabled = data['enabled']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Monitor updated successfully',
        'data': monitor.to_dict()
    }), 200

@monitors_bp.route('/<int:monitor_id>', methods=['DELETE'])
def delete_monitor(monitor_id):
    """Delete a monitor."""
    user_id = require_auth()
    
    monitor = Monitor.query.get(monitor_id)
    if not monitor:
        raise NotFoundError(f"Monitor with ID {monitor_id} not found")
    
    check_monitor_ownership(monitor, user_id)
    
    db.session.delete(monitor)
    db.session.commit()
    
    return jsonify({
        'message': 'Monitor deleted successfully'
    }), 200

@monitors_bp.route('/<int:monitor_id>/run', methods=['POST'])
def run_monitor(monitor_id):
    """
    Run a manual ping for a monitor.
    """
    user_id = require_auth()
    
    monitor = Monitor.query.get(monitor_id)
    if not monitor:
        raise NotFoundError(f"Monitor with ID {monitor_id} not found")
    
    check_monitor_ownership(monitor, user_id)
    
    monitor_service = MonitorService()
    
    # Run async ping
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        ping_result = loop.run_until_complete(monitor_service.ping_url(monitor.target_url))
    finally:
        loop.close()
    
    # Save result to database
    result = MonitorService.create_monitor_result(monitor, ping_result)
    db.session.add(result)
    db.session.commit()
    
    return jsonify({
        'message': 'Monitor ping completed',
        'data': result.to_dict()
    }), 200

@monitors_bp.route('/<int:monitor_id>/results/latest', methods=['GET'])
def get_latest_result(monitor_id):
    """Get the latest monitor result."""
    user_id = require_auth()
    
    monitor = Monitor.query.get(monitor_id)
    if not monitor:
        raise NotFoundError(f"Monitor with ID {monitor_id} not found")
    
    check_monitor_ownership(monitor, user_id)
    
    result = monitor.get_latest_result()
    if not result:
        raise NotFoundError("No results found for this monitor")
    
    return jsonify({
        'data': result
    }), 200

@monitors_bp.route('/<int:monitor_id>/results/history', methods=['GET'])
def get_result_history(monitor_id):
    """Get monitor result history with pagination."""
    user_id = require_auth()
    
    monitor = Monitor.query.get(monitor_id)
    if not monitor:
        raise NotFoundError(f"Monitor with ID {monitor_id} not found")
    
    check_monitor_ownership(monitor, user_id)
    
    # Pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    paginated = MonitorResult.query.filter_by(monitor_id=monitor_id).order_by(
        MonitorResult.checked_at.desc()
    ).paginate(page=page, per_page=per_page)
    
    return jsonify({
        'data': [r.to_dict() for r in paginated.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': paginated.total,
            'pages': paginated.pages,
        }
    }), 200
