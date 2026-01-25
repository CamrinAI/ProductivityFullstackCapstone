"""Voice-to-Inventory Routes
Converts audio input to structured inventory updates using OpenAI Whisper (transcription) + GPT-4o (parsing).
Allows users to update assets and materials via natural language voice commands.
"""
from flask import Blueprint, request, jsonify
from app import db
from app.models import Asset, Material
from app.utils.error_handler import APIError, ValidationError
from app.services import VoiceService
from datetime import datetime

voice_bp = Blueprint('voice', __name__, url_prefix='/api/voice')

@voice_bp.route('/update', methods=['POST'])
def voice_update():
    """
    Primary voice-to-inventory endpoint.
    Process: Audio → Whisper transcription → GPT-4o parsing → Database update
    
    Supports natural language commands like:
      - "Add 5 spools of wire to warehouse"
      - "Check in the Milwaukee drill"
    
    Returns: Updated asset/material object with transcript
    """
    try:
        if 'audio' not in request.files:
            raise ValidationError("No audio file provided")
        
        audio_file = request.files['audio']
        if not audio_file or audio_file.filename == '':
            raise ValidationError("No audio file selected")
        
        # 1. Transcribe audio with Whisper, parse intent with GPT-4o
        intent = VoiceService.process_voice(audio_file)
        
        item_name = intent.get('item', '').strip()
        quantity = intent.get('quantity', 1)
        action = intent.get('action', 'add')
        item_type = intent.get('type', 'material')
        
        if not item_name:
            raise ValidationError("Could not understand item name from audio")
        
        if action not in ['add', 'remove']:
            raise ValidationError(f"Invalid action: {action}")
        
        # 2. Update database based on parsed intent
        if item_type == 'asset':
            # Handle asset checkout/checkin via voice
            asset = Asset.query.filter_by(name=item_name).first()
            if not asset:
                raise ValidationError(f"Asset '{item_name}' not found")
            
            if action == 'add':
                asset.is_available = True
                asset.checkout_date = None
            else:  # remove = checkout
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
            material = Material.query.filter_by(name=item_name).first()
            
            if not material:
                # Create new material if doesn't exist
                material = Material(
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
def get_transcript_only():
    """Debug endpoint: return raw transcription without intent parsing. Useful for testing Whisper accuracy."""
    try:
        if 'audio' not in request.files:
            raise ValidationError("No audio file provided")
        
        audio_file = request.files['audio']
        # Call Whisper transcription only, skip GPT-4o parsing
        transcript = VoiceService.transcribe_audio(audio_file)
        
        return jsonify({
            'success': True,
            'transcript': transcript
        }), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
