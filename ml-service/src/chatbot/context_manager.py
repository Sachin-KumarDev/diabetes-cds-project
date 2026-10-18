"""
Context Manager for Chatbot Conversations
"""
from typing import List, Dict, Optional
from datetime import datetime

class ContextManager:
    """Manages conversation context and history"""
    
    def __init__(self, max_history: int = 10):
        self.max_history = max_history
        self.conversation_history: List[Dict] = []
        self.patient_context: Dict = {}
        self.session_id: Optional[str] = None
        
    def start_session(self, patient_data: Optional[Dict] = None):
        self.session_id = f"session_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        self.conversation_history = []
        self.patient_context = patient_data or {}
        return self.session_id
    
    def add_message(self, role: str, content: str):
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        }
        self.conversation_history.append(message)
        if len(self.conversation_history) > self.max_history:
            self.conversation_history = self.conversation_history[-self.max_history:]
        return message
    
    def get_history(self) -> List[Dict]:
        return self.conversation_history
    
    def get_context(self) -> Dict:
        return {
            "patient": self.patient_context,
            "history": self.conversation_history[-5:],
            "session_id": self.session_id
        }
    
    def update_patient_context(self, patient_data: Dict):
        self.patient_context.update(patient_data)