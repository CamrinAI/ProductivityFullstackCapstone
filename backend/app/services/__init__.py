"""Voice processing service using OpenAI Whisper and GPT-4o."""
import os
import json
import openai
from typing import Dict, Any

openai.api_key = os.getenv('OPENAI_API_KEY')

class VoiceService:
    """Handle voice transcription and intent parsing."""
    
    @staticmethod
    def transcribe_audio(audio_file) -> str:
        """
        Transcribe audio file using OpenAI Whisper API.
        
        Args:
            audio_file: Audio file object from request
            
        Returns:
            Transcribed text
            
        Raises:
            Exception: If Whisper API fails
        """
        try:
            response = openai.Audio.transcribe(
                model="whisper-1",
                file=audio_file,
                language="en"
            )
            return response['text']
        except Exception as e:
            raise Exception(f"Whisper transcription failed: {str(e)}")
    
    @staticmethod
    def parse_intent(transcript: str) -> Dict[str, Any]:
        """
        Parse transcript into structured inventory action using GPT-4o.
        
        Args:
            transcript: Transcribed voice text
            
        Returns:
            Dict with keys: item, quantity, action, type
            
        Raises:
            Exception: If GPT-4o parsing fails
        """
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an inventory assistant. Parse voice commands into JSON. Respond ONLY with valid JSON."
                    },
                    {
                        "role": "user",
                        "content": f"""Parse this inventory command and return JSON:
"{transcript}"

Return format:
{{
    "item": "item name",
    "quantity": number,
    "action": "add" or "remove",
    "type": "asset" or "material",
    "confidence": 0.0-1.0
}}

Be smart about quantity - if not specified, assume 1."""
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.3
            )
            
            content = response['choices'][0]['message']['content']
            data = json.loads(content)
            return data
        except Exception as e:
            raise Exception(f"GPT-4o parsing failed: {str(e)}")
    
    @staticmethod
    def process_voice(audio_file) -> Dict[str, Any]:
        """
        Complete voice-to-inventory pipeline.
        
        Args:
            audio_file: Audio file from request
            
        Returns:
            Parsed inventory action
        """
        transcript = VoiceService.transcribe_audio(audio_file)
        intent = VoiceService.parse_intent(transcript)
        intent['transcript'] = transcript  # Include for debugging
        return intent
