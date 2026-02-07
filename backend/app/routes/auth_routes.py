"""Authentication routes for Trade-Tracker."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models import User
from app.utils.error_handler import ValidationError, APIError
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password') or not data.get('email'):
            raise ValidationError("username, password, and email required")
        
        # Check if user exists
        if User.query.filter_by(username=data['username']).first():
            raise ValidationError("username already exists")
        
        if User.query.filter_by(email=data['email']).first():
            raise ValidationError("email already exists")
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            company=data.get('company', ''),
            role='technician'
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Create token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'success': True,
            'message': 'User created successfully',
            'user': user.to_dict(),
            'access_token': access_token
        }), 201
    
    except ValidationError as e:
        return jsonify({'success': False, 'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user and return JWT token."""
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            raise ValidationError("username and password required")
        
        user = User.query.filter_by(username=data['username']).first()
        
        if not user or not check_password_hash(user.password_hash, data['password']):
            raise APIError("Invalid username or password", 401)
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token
        }), 200
    
    except ValidationError as e:
        return jsonify({'success': False, 'error': e.message}), e.status_code
    except APIError as e:
        return jsonify({'success': False, 'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current authenticated user."""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            raise APIError("User not found", 404)
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        }), 200
    
    except APIError as e:
        return jsonify({'success': False, 'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (JWT is stateless, so just return success)."""
    return jsonify({
        'success': True,
        'message': 'Logout successful'
    }), 200

@auth_bp.route('/change-role', methods=['POST'])
@jwt_required()
def change_role():
    """Change user role (for demo/testing purposes)."""
    try:
        data = request.get_json() or {}
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            raise APIError("User not found", 404)
        
        new_role = data.get('role')
        if not new_role or new_role not in ['technician', 'foreman', 'superintendent']:
            raise ValidationError("Invalid role. Must be: technician, foreman, or superintendent")
        
        user.role = new_role
        db.session.commit()
        
        # Create new token with updated role
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'success': True,
            'message': f'Role changed to {new_role}',
            'user': user.to_dict(),
            'access_token': access_token
        }), 200
    
    except ValidationError as e:
        return jsonify({'success': False, 'error': e.message}), e.status_code
    except APIError as e:
        return jsonify({'success': False, 'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@auth_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    """Get all users (for onsite list)."""
    try:
        users = User.query.filter_by(is_active=True).all()
        return jsonify({
            'success': True,
            'users': [user.to_dict() for user in users]
        }), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
