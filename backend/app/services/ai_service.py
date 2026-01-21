from typing import Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.services.user_service import UserService
from app.models import User


class AIService:
    """Service for handling AI requests with credit deduction"""
    
    def __init__(self, db: Session):
        self.db = db
        self.user_service = UserService(db)
    
    def get_ai_model_rate(self, model: str) -> float:
        """Get credit rate for AI model"""
        model_rates = {
            "openai-gpt4": settings.OPENAI_GPT4_CREDIT_RATE,
            "openai-gpt3.5": settings.OPENAI_GPT35_CREDIT_RATE,
            "openai-gpt35": settings.OPENAI_GPT35_CREDIT_RATE,  # Alternative naming
            "gemini": settings.GEMINI_CREDIT_RATE,
            "google-gemini": settings.GEMINI_CREDIT_RATE,  # Alternative naming
        }
        
        return model_rates.get(model.lower(), 1.0)  # Default to 1.0 if model not found
    
    async def can_afford_ai_request(self, user_id: int, model: str) -> bool:
        """Check if user has enough credits for AI request"""
        user = await self.user_service.get_user(user_id)
        if not user:
            return False
        
        required_credits = self.get_ai_model_rate(model)
        return user.credits >= required_credits
    
    async def deduct_ai_credits(self, user_id: int, model: str) -> bool:
        """Deduct credits for AI model usage"""
        required_credits = self.get_ai_model_rate(model)
        return await self.user_service.deduct_credits(user_id, required_credits)
    
    async def process_ai_request(self, user_id: int, model: str, message: str) -> Optional[dict]:
        """Process AI request with credit deduction"""
        # Check if user can afford the request
        if not await self.can_afford_ai_request(user_id, model):
            return {
                "error": "Insufficient credits",
                "required_credits": self.get_ai_model_rate(model),
                "user_credits": (await self.user_service.get_user(user_id)).credits if await self.user_service.get_user(user_id) else 0
            }
        
        # Deduct credits first
        if not await self.deduct_ai_credits(user_id, model):
            return {"error": "Failed to deduct credits"}
        
        # Process AI request (placeholder for actual AI integration)
        try:
            # This is where you would integrate with OpenAI, Gemini etc.
            ai_response = await self._call_ai_model(model, message)
            
            return {
                "response": ai_response,
                "model": model,
                "credits_used": self.get_ai_model_rate(model),
                "success": True
            }
        except Exception as e:
            # Refund credits on AI error
            await self.user_service.update_user_credits(user_id, self.get_ai_model_rate(model))
            return {"error": f"AI request failed: {str(e)}"}
    
    async def _call_ai_model(self, model: str, message: str) -> str:
        """Call the actual AI model"""
        if model.startswith("openai"):
            return await self._call_openai(model, message)
        elif model in ["gemini", "google-gemini"]:
            return await self._call_gemini(message)
        else:
            return f"Unknown model {model} response to: {message}"
    
    async def _call_openai(self, model: str, message: str) -> str:
        """Call OpenAI API"""
        try:
            # This would use the actual OpenAI API
            # For now, return a realistic response format
            model_name = "gpt-4" if "gpt4" in model else "gpt-3.5-turbo"
            
            # In real implementation:
            # import openai
            # client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            # response = client.chat.completions.create(
            #     model=model_name,
            #     messages=[{"role": "user", "content": message}]
            # )
            # return response.choices[0].message.content
            
            # For demonstration (replace with real API call):
            return f"AI ({model_name}): This is a response to '{message}'. [Real API integration needed]"
            
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")
    
    async def _call_gemini(self, message: str) -> str:
        """Call Google Gemini API"""
        try:
            # This would use the actual Gemini API
            # For now, return a realistic response format
            
            # In real implementation:
            # import google.generativeai as genai
            # genai.configure(api_key=settings.GOOGLE_GEMINI_API_KEY)
            # model = genai.GenerativeModel('gemini-pro')
            # response = model.generate_content(message)
            # return response.text
            
            # For demonstration (replace with real API call):
            return f"AI (Gemini): This is a response to '{message}'. [Real API integration needed]"
            
        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")