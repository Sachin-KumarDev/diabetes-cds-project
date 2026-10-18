"""
Clinical Chatbot Agent
"""
from typing import Dict, Any, Optional
from .knowledge_base import KnowledgeBase
from .context_manager import ContextManager
from .prompts import SYSTEM_PROMPT, SUGGESTED_QUESTIONS

class ClinicalChatbot:
    """Clinical Chatbot for Diabetes Decision Support"""
    
    def __init__(self):
        self.knowledge = KnowledgeBase()
        self.context_manager = ContextManager()
        
    def start_conversation(self, patient_data: Optional[Dict] = None):
        session_id = self.context_manager.start_session(patient_data)
        return {
            "session_id": session_id,
            "welcome_message": self._get_welcome_message(patient_data),
            "suggested_questions": SUGGESTED_QUESTIONS[:5]
        }
    
    def _get_welcome_message(self, patient_data: Optional[Dict] = None) -> str:
        if patient_data:
            name = patient_data.get('name', 'Patient')
            age = patient_data.get('age', '')
            return f"👋 Hello! I'm Dr. AI, your clinical diabetes assistant. I see you're reviewing {name}'s case (Age: {age}). How can I help you interpret their data or understand their diabetes risk?"
        else:
            return "👋 Hello! I'm Dr. AI, your clinical diabetes assistant. I can help you understand diabetes risk factors, interpret patient data, and provide clinical insights. What would you like to know?"
    
    def chat(self, question: str) -> Dict:
        """Process a question and return response"""
        self.context_manager.add_message("user", question)
        context = self.context_manager.get_context()
        patient = context.get("patient", {})
        
        response = self._generate_response(question, patient)
        self.context_manager.add_message("assistant", response)
        
        return {
            "response": response,
            "suggested_questions": SUGGESTED_QUESTIONS[:5],
            "session_id": context.get("session_id"),
            "conversation_summary": self.context_manager.get_conversation_summary() if hasattr(self.context_manager, 'get_conversation_summary') else "Conversation in progress"
        }
    
    def _generate_response(self, question: str, patient: Dict) -> str:
        question_lower = question.lower()
        
        # Check question type and respond accordingly
        if any(word in question_lower for word in ["risk", "factor", "predisposing"]):
            return self._handle_risk_factors(patient)
        
        if any(word in question_lower for word in ["symptom", "sign", "feeling"]):
            return self.knowledge.get_symptoms_text()
        
        if any(word in question_lower for word in ["treat", "medication", "medicine", "drug"]):
            return self.knowledge.get_treatment_text()
        
        if "glucose" in question_lower or "blood sugar" in question_lower:
            return self._handle_glucose(patient)
        
        if "hba1c" in question_lower or "a1c" in question_lower:
            return self._handle_hba1c(patient)
        
        if "bmi" in question_lower or "weight" in question_lower:
            return self._handle_bmi(patient)
        
        if "complication" in question_lower:
            return self._handle_complications()
        
        if "guideline" in question_lower or "recommend" in question_lower:
            return self._handle_guidelines()
        
        # Fallback
        return self._get_fallback_response()
    
    def _handle_risk_factors(self, patient: Dict) -> str:
        risk_text = self.knowledge.get_risk_factors_text()
        patient_risks = []
        
        if patient.get('bmi', 0) > 30:
            patient_risks.append("Obese BMI (>30)")
        if patient.get('age', 0) > 45:
            patient_risks.append("Age >45")
        if patient.get('glucose', 0) > 126:
            patient_risks.append("Elevated blood glucose")
        if patient.get('hba1c', 0) > 6.5:
            patient_risks.append("Elevated HbA1c (>6.5%)")
        
        response = risk_text
        if patient_risks:
            response += f"\n\n**Patient's Specific Risks:**\n- " + "\n- ".join(patient_risks)
        
        return response
    
    def _handle_glucose(self, patient: Dict) -> str:
        glucose = patient.get('glucose', patient.get('blood_glucose_level', None))
        if glucose is None:
            return "I don't have glucose data. Please provide a glucose reading."
        
        if glucose < 100:
            status = "normal"
            advice = "Continue current management."
        elif 100 <= glucose < 126:
            status = "prediabetic range"
            advice = "Consider lifestyle modifications."
        else:
            status = "diabetic range"
            advice = "Consult with an endocrinologist."
        
        return f"**Blood Glucose Analysis:**\nGlucose: {glucose} mg/dL\nStatus: {status}\n\n**Recommendation:** {advice}\n\n*Normal: <100 | Prediabetes: 100-125 | Diabetes: ≥126*"
    
    def _handle_hba1c(self, patient: Dict) -> str:
        hba1c = patient.get('hba1c', patient.get('HbA1c_level', None))
        if hba1c is None:
            return "I don't have HbA1c data."
        
        if hba1c < 5.7:
            status = "normal"
            advice = "Good glycemic control."
        elif 5.7 <= hba1c < 6.5:
            status = "prediabetic range"
            advice = "Lifestyle intervention recommended."
        else:
            status = "diabetic range"
            advice = "Consider intensifying treatment."
        
        return f"**HbA1c Analysis:**\nHbA1c: {hba1c}%\nStatus: {status}\n\n**Recommendation:** {advice}\n\n*Normal: <5.7% | Prediabetes: 5.7-6.4% | Diabetes: ≥6.5%*"
    
    def _handle_bmi(self, patient: Dict) -> str:
        bmi = patient.get('bmi', None)
        if bmi is None:
            return "I don't have BMI data."
        
        if bmi < 18.5:
            category = "Underweight"
            recommendation = "Nutritional counseling recommended."
        elif 18.5 <= bmi < 25:
            category = "Normal"
            recommendation = "Maintain healthy lifestyle."
        elif 25 <= bmi < 30:
            category = "Overweight"
            recommendation = "Consider weight management."
        else:
            category = "Obese"
            recommendation = "Weight loss of 5-10% recommended."
        
        return f"**BMI Analysis:**\nBMI: {bmi:.1f}\nCategory: {category}\n\n**Recommendation:** {recommendation}"
    
    def _handle_complications(self) -> str:
        comp = self.knowledge.knowledge["complications"]
        return f"**Diabetes Complications:**\n\n**Short-term:**\n- " + "\n- ".join(comp["short_term"]) + "\n\n**Long-term:**\n- " + "\n- ".join(comp["long_term"])
    
    def _handle_guidelines(self) -> str:
        return """**Clinical Guidelines (ADA 2024):**

1. **Screening:** All adults ≥45 years; earlier if overweight/obese with risk factors
2. **Diagnosis:** Fasting glucose ≥126 mg/dL, HbA1c ≥6.5%
3. **Management:** Lifestyle + Metformin first-line
4. **Monitoring:** HbA1c every 3-6 months"""
    
    def _get_fallback_response(self) -> str:
        return """I appreciate your question. While I have knowledge about diabetes, here's what I can help with:

- **Risk Factors** - Ask about diabetes risk factors
- **Symptoms** - Learn about diabetes symptoms
- **Treatment** - Information about treatment options
- **Glucose/HbA1c** - Interpret lab results
- **Guidelines** - Clinical guidelines
- **Complications** - Diabetes complications

Please rephrase your question!"""