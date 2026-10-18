"""
Medical Knowledge Base for Diabetes
"""
import os
import json
from typing import Dict, List

class KnowledgeBase:
    """Simple knowledge base for diabetes information"""
    
    def __init__(self):
        self.knowledge = self._load_knowledge()
        
    def _load_knowledge(self) -> Dict:
        knowledge = {
            "risk_factors": {
                "non_modifiable": ["Age", "Family History", "Ethnicity"],
                "modifiable": ["BMI", "Physical Activity", "Diet", "Smoking"]
            },
            "symptoms": [
                "Frequent urination",
                "Excessive thirst",
                "Unexplained weight loss",
                "Extreme hunger",
                "Blurry vision",
                "Numbness/tingling in hands/feet",
                "Fatigue"
            ],
            "diagnostic_criteria": {
                "fasting_glucose": {
                    "normal": "<100 mg/dL",
                    "prediabetes": "100-125 mg/dL",
                    "diabetes": ">=126 mg/dL"
                },
                "hba1c": {
                    "normal": "<5.7%",
                    "prediabetes": "5.7-6.4%",
                    "diabetes": ">=6.5%"
                }
            },
            "treatment_options": {
                "lifestyle": [
                    "Healthy eating (Mediterranean diet)",
                    "Regular exercise (150 minutes/week)",
                    "Weight management",
                    "Smoking cessation"
                ],
                "medications": [
                    "Metformin (first-line)",
                    "SGLT-2 inhibitors",
                    "GLP-1 receptor agonists",
                    "Insulin therapy"
                ]
            },
            "complications": {
                "short_term": ["Hypoglycemia", "Hyperglycemia", "Diabetic ketoacidosis"],
                "long_term": [
                    "Cardiovascular disease",
                    "Neuropathy",
                    "Nephropathy",
                    "Retinopathy"
                ]
            }
        }
        return knowledge
    
    def search(self, query: str) -> Dict:
        query_lower = query.lower()
        results = {}
        
        if "risk" in query_lower or "factor" in query_lower:
            results["risk_factors"] = self.knowledge["risk_factors"]
        if "symptom" in query_lower or "sign" in query_lower:
            results["symptoms"] = self.knowledge["symptoms"]
        if "diagnos" in query_lower or "glucose" in query_lower or "hba1c" in query_lower:
            results["diagnostic_criteria"] = self.knowledge["diagnostic_criteria"]
        if "treat" in query_lower or "medication" in query_lower:
            results["treatment_options"] = self.knowledge["treatment_options"]
        if "complication" in query_lower:
            results["complications"] = self.knowledge["complications"]
        
        return results
    
    def get_risk_factors_text(self) -> str:
        rf = self.knowledge["risk_factors"]
        text = "**Risk Factors:**\n"
        text += f"- Non-modifiable: {', '.join(rf['non_modifiable'])}\n"
        text += f"- Modifiable: {', '.join(rf['modifiable'])}"
        return text
    
    def get_symptoms_text(self) -> str:
        return "**Common Symptoms:**\n- " + "\n- ".join(self.knowledge["symptoms"])
    
    def get_treatment_text(self) -> str:
        t = self.knowledge["treatment_options"]
        text = "**Treatment Options:**\n"
        text += f"- Lifestyle: {', '.join(t['lifestyle'])}\n"
        text += f"- Medications: {', '.join(t['medications'])}"
        return text