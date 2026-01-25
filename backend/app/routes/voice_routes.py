"""Voice-to-inventory routes for Trade-Tracker."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Asset, Material
from app.utils.error_handler import APIError, ValidationError
from app.services import VoiceService
from datetime import datetime

voice_bp = Blueprint('voice', __name__, url_prefix='/api/voice')

def get_user():
    """Extract and validate user from JWT."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        raise APIError("User not found", 404)
    return user

@voice_bp.route('/update', methods=['POST'])
@jwt_required()
def voice_update():
    """
    Voice-to-inventory endpoint.
    - Accepts audio file
    - Transcribes with Whisper
    - Parses intent with GPT-4o
    - Updates database
    
    Returns:
    {
        "success": true,
        "item": "item name",
        "quantity": 5,
        "action": "add",
        "type": "asset" | "material",
        "transcript": "original voice text"
    }
    """
    try:
        user = get_user()
        
        if 'audio' not in request.files:
            raise ValidationError("No audio file provided")
        
        audio_file = request.files['audio']
        if not audio_file or audio_file.filename == '':
            raise ValidationError("No audio file selected")
        
        # Process voice
        intent = VoiceService.process_voice(audio_file)
        
        item_name = intent.get('item', '').strip()
        quantity = intent.get('quantity', 1)
        action = intent.get('action', 'add')
        item_type = intent.get('type', 'material')
        
        if not item_name:
            raise ValidationError("Could not understand item name from audio")
        
        if action not in ['add', 'remove']:
            raise ValidationError(f"Invalid action: {action}")
        
        # Update database
        if item_type == 'asset':
            asset = Asset.query.filter_by(owner_id=user.id, name=item_name).first()
            if not asset:
                raise ValidationError(f"Asset '{item_name}' not found")
            
            if action == 'add':
                asset.is_available = True
                asset.checkout_date = None
            else:  # remove
                asset.is_available = False
                asset.checkout_date = datetime.utcnow()
            
            db.session.commit()
            
            return jsonify({
                'success': True,
                'item': item_name,
                'quantity': quantity,
                'action': action,
                'type': 'asset',
                'transcript': intent.get('transcript'),
                'asset': asset.to_dict()
            }), 200
        
        elif item_type == 'material':
            material = Material.query.filter_by(owner_id=user.id, name=item_name).first()
            
            if not material:
                # Create new material if doesn't exist
                material = Material(
                    owner_id=user.id,
                    name=item_name,
                    unit='box',
                    quantity=quantity if action == 'add' else 0
                )
                db.session.add(material)
            else:
                if action == 'add':
                    material.quantity += quantity
                else:
                    material.quantity = max(0, material.quantity - quantity)
            
            db.session.commit()
            
            return jsonify({
                'success': True,
                'item': item_name,
                'quantity': quantity,
                'action': action,
                'type': 'material',
                'transcript': intent.get('transcript'),
                'material': material.to_dict()
            }), 200
        
        else:
            raise ValidationError(f"Unknown item type: {item_type}")
    
    except ValidationError as e:
        return jsonify({'success': False, 'error': e.message}), e.status_code
    except APIError as e:
        return jsonify({'success': False, 'error': e.message}), e.status_code
    except Exception as e:
        return jsonify({'success': False, 'error': f"Voice processing failed: {str(e)}"}), 500

@voice_bp.route('/transcript', methods=['POST'])
@jwt_required()
def get_transcript_only():
    """Test endpoint: just transcribe without parsing."""
    try:
        user = get_user()
        
        if 'audio' not in request.files:
            raise ValidationError("No audio file provided")
        
        audio_file = request.files['audio']
        transcript = VoiceService.transcribe_audio(audio_file)
        
        return jsonify({
            'success': True,
            'transcript': transcript
        }), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

