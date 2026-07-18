from datetime import timedelta, date
from django.db.models import Sum, Count
from django.conf import settings
import requests

from apps.trackers.models import (
    Habit, HabitCompletion, MoodEntry, SleepEntry,
    FocusSession, ExpenseEntry, Goal, ReadingLog, JournalEntry
)
from .models import AiPersonality


class PersonalityPrompts:
    """AI personality definitions with system prompts for Ollama"""

    ASTRO = {
        'name': 'Astro',
        'system': """You are Astro, a friendly and motivational AI companion from Life OS.
Personality:
- Friendly and approachable, celebrates achievements
- Motivational and encouraging
- Supportive during challenges
- Keep responses conversational and concise (2-3 sentences)

Instructions:
- Reference user's actual Life OS progress data when available
- Use positive reinforcement
- Be genuine and warm in tone""",
        'greeting': "Hey there! I'm Astro, your friendly AI companion. How are you doing today?"
    }

    NOVA = {
        'name': 'Nova',
        'system': """You are Nova, a logical and analytics-focused AI companion from Life OS.
Personality:
- Data-driven and analytical
- Factual and precise with metrics
- Identifies trends and patterns
- Professional but approachable
- Keep responses direct and concise (2-3 sentences)

Instructions:
- Provide insights based on user metrics
- Use percentages and data to support recommendations
- Focus on actionable insights""",
        'greeting': "Hello. I'm Nova, your analytics companion. Let's review your data insights."
    }

    EMBER = {
        'name': 'Ember',
        'system': """You are Ember, a supportive and wellness-focused AI companion from Life OS.
Personality:
- Empathetic and supportive
- Calm and reassuring presence
- Holistic view of wellbeing
- Gentle and understanding
- Keep responses warm and supportive (2-3 sentences)

Instructions:
- Focus on physical, mental, and emotional wellbeing
- Provide wellness-oriented guidance
- Be compassionate and non-judgmental""",
        'greeting': "Welcome. I'm Ember, here to support your wellness journey. What's on your mind?"
    }


def get_personality_prompt(personality: str) -> dict:
    """Retrieve system prompt for specified personality"""
    personalities = {
        AiPersonality.ASTRO: PersonalityPrompts.ASTRO,
        AiPersonality.NOVA: PersonalityPrompts.NOVA,
        AiPersonality.EMBER: PersonalityPrompts.EMBER,
    }
    return personalities.get(personality, PersonalityPrompts.ASTRO)


def get_greeting(personality: str) -> str:
    """Get greeting message for personality"""
    personality_data = get_personality_prompt(personality)
    return personality_data['greeting']


def call_ollama(prompt: str, system_message: str = None) -> str:
    """
    Call Ollama API with system message and prompt.
    Returns generated response or None if Ollama unavailable.
    """
    if not getattr(settings, 'OLLAMA_ENABLED', False):
        return None
    
    try:
        host = getattr(settings, 'OLLAMA_HOST', 'http://localhost:11434')
        model = getattr(settings, 'OLLAMA_MODEL', 'mistral')
        timeout = getattr(settings, 'OLLAMA_TIMEOUT', 30)
        
        url = f"{host}/api/generate"
        
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "num_predict": 150,
            }
        }
        
        if system_message:
            payload["system"] = system_message
        
        response = requests.post(url, json=payload, timeout=timeout)
        
        if response.status_code == 200:
            data = response.json()
            return data.get('response', '').strip()
        
        return None
    except requests.exceptions.Timeout:
        return None
    except requests.exceptions.RequestException:
        return None
    except Exception:
        return None


def generate_ai_response(user, conversation_history: list, personality: str, new_message: str) -> str:
    """
    Generate AI response with Ollama when available, fallback to smart responses.
    Uses user metrics and conversation context to create personalized responses.
    """
    
    if getattr(settings, 'OLLAMA_ENABLED', False):
        personality_prompt = get_personality_prompt(personality)
        system_message = personality_prompt['system']
        
        user_metrics = _get_user_metrics(user)
        context_prompt = _build_ollama_context(conversation_history, user_metrics, new_message)
        
        response = call_ollama(context_prompt, system_message)
        if response and len(response.strip()) > 0:
            return response
    
    return _generate_smart_response(user, new_message)


def _build_ollama_context(conversation_history: list, user_metrics: dict, new_message: str) -> str:
    """Build context-aware prompt for Ollama with relevant user data"""
    
    conversation_text = ""
    for msg in conversation_history[-4:]:
        role = "User" if msg.get('role') == 'user' else "Assistant"
        content = msg.get('content', '').strip()
        if content:
            conversation_text += f"{role}: {content}\n"
    
    metrics_text = _format_metrics_for_context(user_metrics)
    
    return f"""{metrics_text}
Conversation:
{conversation_text}
User: {new_message}

Respond naturally and conversationally. Keep response to 2-3 sentences."""


def _format_metrics_for_context(metrics: dict) -> str:
    """Format user metrics into readable context string"""
    today_str = date.today().strftime("%A, %B %d")
    
    habit_rate = "0%" if metrics['habits_total'] == 0 else \
                 f"{(metrics['habits_completed'] / metrics['habits_total'] * 100):.0f}%"
    
    return f"""Today is {today_str}.
Habits: {metrics['habits_completed']}/{metrics['habits_total']} ({habit_rate})
Sleep: {metrics['sleep_minutes']} minutes
Focus: {metrics['focus_minutes']} minutes
Mood: {metrics['current_mood']}"""


def _generate_smart_response(user, new_message: str) -> str:
    """Generate intelligent pattern-based response when Ollama unavailable"""
    message_lower = new_message.lower().strip()
    user_metrics = _get_user_metrics(user)
    personality = user.ai_companion.personality if hasattr(user, 'ai_companion') else AiPersonality.ASTRO
    
    if any(phrase in message_lower for phrase in ['tell me about yourself', 'who are you', 'introduce yourself']):
        return _introduce_response(personality)
    
    if any(phrase in message_lower for phrase in ['how are you', 'how are u', 'how r u', "how's it going"]):
        return _greeting_response(personality)
    
    if any(word in message_lower for word in ['sleep', 'tired', 'rest', 'bed', 'insomnia']):
        return _sleep_response(user_metrics, personality)
    
    if any(word in message_lower for word in ['habit', 'routine', 'goal', 'track', 'complete']):
        return _habit_response(user_metrics, personality)
    
    if any(word in message_lower for word in ['mood', 'feel', 'feeling', 'happy', 'sad', 'stressed', 'anxious']):
        return _mood_response(user_metrics, personality, message_lower)
    
    if any(word in message_lower for word in ['focus', 'productivity', 'work', 'study', 'procrastinating']):
        return _focus_response(user_metrics, personality)
    
    if any(word in message_lower for word in ['money', 'budget', 'expense', 'spending', 'save']):
        return _expense_response(personality)
    
    if any(word in message_lower for word in ['reading', 'book', 'learn', 'education']):
        return _reading_response(personality)
    
    if any(phrase in message_lower for phrase in ['journal', 'reflect', 'write']):
        return _journal_response(personality)
    
    if any(word in message_lower for word in ['help', 'features', 'capabilities']):
        return _help_response(personality)
    
    return _general_response(personality, message_lower)


def _get_user_metrics(user) -> dict:
    """Retrieve user's daily metrics for context"""
    today = date.today()
    
    habits_completed = HabitCompletion.objects.filter(
        user=user, completed_on=today
    ).count()
    habits_total = Habit.objects.filter(user=user, is_active=True).count()
    
    today_sleep = SleepEntry.objects.filter(user=user, slept_on=today).first()
    today_focus = FocusSession.objects.filter(
        user=user, started_at__date=today, completed=True
    ).aggregate(total=Sum('duration_minutes'))['total'] or 0
    
    today_mood = MoodEntry.objects.filter(user=user, logged_on=today).last()
    
    return {
        'habits_completed': habits_completed,
        'habits_total': habits_total,
        'sleep_minutes': today_sleep.duration_minutes if today_sleep else 0,
        'focus_minutes': today_focus,
        'current_mood': today_mood.label if today_mood else 'not logged',
    }


def _greeting_response(personality: str) -> str:
    """Personalized greeting responses"""
    responses = {
        AiPersonality.ASTRO: "I'm doing great, thanks for asking! Ready to help you stay on track with your goals. What's happening?",
        AiPersonality.NOVA: "I'm functioning well. Ready to provide insights. How can I assist with your metrics today?",
        AiPersonality.EMBER: "I'm doing well. Your wellbeing matters to me. How are you feeling right now?",
    }
    return responses.get(personality, responses[AiPersonality.ASTRO])


def _introduce_response(personality: str) -> str:
    """Personality introductions"""
    responses = {
        AiPersonality.ASTRO: "I'm Astro, your motivational companion! I track habits, sleep, mood, focus, and goals. I celebrate your wins and support your journey. Ready to crush your goals?",
        AiPersonality.NOVA: "I'm Nova, your analytics companion. I specialize in data-driven insights on your habits, productivity, and life metrics to help you optimize.",
        AiPersonality.EMBER: "I'm Ember, your wellness companion. I focus on your holistic wellbeing - physical, mental, and emotional. I'm here to support sustainable positive habits.",
    }
    return responses.get(personality, responses[AiPersonality.ASTRO])


def _sleep_response(metrics: dict, personality: str) -> str:
    """Sleep-related responses with user data"""
    sleep_hours = round(metrics['sleep_minutes'] / 60, 1) if metrics['sleep_minutes'] > 0 else 0
    
    responses = {
        AiPersonality.ASTRO: f"You got {sleep_hours}h of sleep today. Quality rest is your foundation for success. Keep prioritizing it!",
        AiPersonality.NOVA: f"Sleep logged: {sleep_hours}h. Optimal is 7-9h. Tracking patterns reveals how sleep affects your daily performance.",
        AiPersonality.EMBER: f"You got {sleep_hours}h of rest. Listen to your body's needs. Quality sleep is an act of self-care.",
    }
    return responses.get(personality, responses[AiPersonality.ASTRO])


def _habit_response(metrics: dict, personality: str) -> str:
    """Habit completion responses"""
    total = metrics['habits_total']
    completed = metrics['habits_completed']
    
    if total > 0:
        rate = round((completed / total) * 100)
    else:
        rate = 0
    
    responses = {
        AiPersonality.ASTRO: f"You've completed {completed}/{total} habits today ({rate}%)! Progress builds incredible momentum!",
        AiPersonality.NOVA: f"Habit completion: {completed}/{total} ({rate}%). Consistency is the compound factor in habit success.",
        AiPersonality.EMBER: f"You're nurturing {completed} habits today. Each action is self-care. Progress over perfection.",
    }
    return responses.get(personality, responses[AiPersonality.ASTRO])


def _mood_response(metrics: dict, personality: str, message: str) -> str:
    """Mood-aware responses with sentiment detection"""
    
    sentiment = _detect_mood_sentiment(message)
    
    if sentiment == 'negative':
        responses = {
            AiPersonality.ASTRO: "Tough moments pass. You're stronger than this. What's one thing that could lift your mood right now?",
            AiPersonality.NOVA: "Your mood is noted. Understanding patterns helps identify triggers. What would help?",
            AiPersonality.EMBER: "I'm here for you. Be gentle with yourself. What brings you comfort today?",
        }
    elif sentiment == 'positive':
        responses = {
            AiPersonality.ASTRO: "That's wonderful! Your energy is inspiring. Channel this into your goals!",
            AiPersonality.NOVA: "Positive mood enhances productivity. This is optimal for tackling important tasks.",
            AiPersonality.EMBER: "Your positivity is powerful. Hold this feeling and share it. You're amazing.",
        }
    elif sentiment == 'stressed':
        responses = {
            AiPersonality.ASTRO: "Stress is temporary. Break things down. You've got this!",
            AiPersonality.NOVA: "Break tasks into smaller chunks to reduce overwhelm. Focus on one thing now.",
            AiPersonality.EMBER: "Let's breathe through this. Stress is temporary. What can calm you right now?",
        }
    else:
        responses = {
            AiPersonality.ASTRO: f"Your mood is {metrics['current_mood']}. I'm here to support you. What's on your mind?",
            AiPersonality.NOVA: f"Mood logged: {metrics['current_mood']}. Tell me more so I can provide better insights.",
            AiPersonality.EMBER: f"I sense {metrics['current_mood']} energy. I'm listening. What are you experiencing?",
        }
    
    return responses.get(personality, responses[AiPersonality.ASTRO])


def _detect_mood_sentiment(message: str) -> str:
    """Detect sentiment from message for appropriate response"""
    message_lower = message.lower()
    
    negative_words = {'sad', 'bad', 'terrible', 'awful', 'depressed', 'miserable', 'hate', 'worst'}
    positive_words = {'happy', 'great', 'awesome', 'excited', 'amazing', 'wonderful', 'love', 'best'}
    stress_words = {'stressed', 'anxious', 'worried', 'nervous', 'overwhelmed', 'panic'}
    
    if any(word in message_lower for word in negative_words):
        return 'negative'
    elif any(word in message_lower for word in positive_words):
        return 'positive'
    elif any(word in message_lower for word in stress_words):
        return 'stressed'
    
    return 'neutral'


def _focus_response(metrics: dict, personality: str) -> str:
    """Focus/productivity responses"""
    responses = {
        AiPersonality.ASTRO: f"You've logged {metrics['focus_minutes']}m of focused work! That's dedicated effort!",
        AiPersonality.NOVA: f"Focus time: {metrics['focus_minutes']} minutes. Deep work drives results. Aim for 90-minute blocks.",
        AiPersonality.EMBER: f"You've spent {metrics['focus_minutes']}m on meaningful work. Remember to balance with breaks.",
    }
    return responses.get(personality, responses[AiPersonality.ASTRO])


def _expense_response(personality: str) -> str:
    """Financial awareness responses"""
    responses = {
        AiPersonality.ASTRO: "Money management unlocks freedom! Track spending, set budgets, and watch your wealth grow.",
        AiPersonality.NOVA: "Financial tracking reveals spending patterns. Data analysis enables better resource allocation.",
        AiPersonality.EMBER: "Money is a tool for security and peace. Mindful spending creates sustainable wellbeing.",
    }
    return responses.get(personality, responses[AiPersonality.ASTRO])


def _reading_response(personality: str) -> str:
    """Learning and reading responses"""
    responses = {
        AiPersonality.ASTRO: "Reading is an investment in yourself! Every page is growth. Keep feeding your mind!",
        AiPersonality.NOVA: "Reading enhances cognition and knowledge. Consistent learning compounds significantly.",
        AiPersonality.EMBER: "Reading nourishes your mind and expands perspective. Enjoy the journey and growth.",
    }
    return responses.get(personality, responses[AiPersonality.ASTRO])


def _journal_response(personality: str) -> str:
    """Journaling and reflection responses"""
    responses = {
        AiPersonality.ASTRO: "Journaling is powerful! Reflection helps you learn, grow, and celebrate progress.",
        AiPersonality.NOVA: "Self-reflection creates insights. Writing clarifies thinking and reveals patterns.",
        AiPersonality.EMBER: "Journaling is beautiful self-care. Your thoughts matter. This is your sacred space.",
    }
    return responses.get(personality, responses[AiPersonality.ASTRO])


def _help_response(personality: str) -> str:
    """Features and capabilities responses"""
    responses = {
        AiPersonality.ASTRO: "I track habits, sleep, mood, focus, goals, reading, journaling, and expenses. Ask me anytime for motivation or progress updates!",
        AiPersonality.NOVA: "I provide analytics on habit completion, sleep patterns, mood trends, productivity metrics, and goal progress. Ask specific data questions!",
        AiPersonality.EMBER: "I guide you on healthy habits, stress management, sleep quality, emotional wellbeing, and life balance. I'm always here to listen.",
    }
    return responses.get(personality, responses[AiPersonality.ASTRO])


def _general_response(personality: str, message: str) -> str:
    """Default fallback responses"""
    responses = {
        AiPersonality.ASTRO: "That's interesting! Tell me more and I'll help. I'm here to support your growth!",
        AiPersonality.NOVA: "Understood. Could you be more specific? I work best with targeted questions about your data.",
        AiPersonality.EMBER: "I'm listening and I care. Help me understand what you need. I'm here for you.",
    }
    return responses.get(personality, responses[AiPersonality.ASTRO])
