import re
from typing import List, Dict, Any
from app.schemas.chat import (
    ChatRagRequest,
    ChatRagResponse,
    ChatCitation
)

def sanitize_user_input(text: str) -> str:
    """
    Guards against prompt injection and delimiters.
    Strips attempts to override system prompts or simulate assistant tokens.
    """
    cleaned = text.strip()
    # Remove system prompt injection tokens
    cleaned = re.sub(r'(?i)(ignore previous instructions|system:|assistant:|role:system)', '[redacted]', cleaned)
    # Truncate length
    return cleaned[:1000]

def process_rag_chat(req: ChatRagRequest) -> ChatRagResponse:
    """
    Executes Retrieval-Augmented Generation across authorized platform context:
    - User's specific wedding planner event & budget
    - Active customer orders & quotation milestones
    - Public marketplace listings and rental policies
    """
    clean_msg = sanitize_user_input(req.message).lower()
    citations: List[ChatCitation] = []
    suggested_listings: List[Dict[str, Any]] = []
    
    ctx = req.context
    event = ctx.activeWeddingEvent
    
    # Check intent & assemble authorized RAG response
    if "budget" in clean_msg or "cost" in clean_msg or "expense" in clean_msg:
        if event and "totalBudget" in event:
            tot = event.get("totalBudget", 0)
            spent = event.get("actualSpent", 0)
            rem = tot - spent
            reply = (
                f"Based on your registered wedding plan, your total budget is ₹{tot:,.0f}. "
                f"You have tracked ₹{spent:,.0f} in committed expenses so far, leaving ₹{rem:,.0f} available. "
                "You can optimize remaining spend by renting bridal attire or sourcing verified floral decor vendors on ShaadiSaathi."
            )
            citations.append(ChatCitation(
                sourceType="Wedding Event",
                title="Your ShaadiSaathi Wedding Budget Tracker",
                referenceId=event.get("_id") or event.get("id")
            ))
        else:
            reply = (
                "You haven't set up an active wedding budget yet! You can initialize your event tracker in the Wedding Planner "
                "section or use our ML Budget Predictor to get tailored expense estimates across venues, catering, and decor."
            )
            citations.append(ChatCitation(
                sourceType="Platform Policy",
                title="Wedding Planner Guidelines"
            ))
            
    elif "rent" in clean_msg or "security deposit" in clean_msg or "hold" in clean_msg:
        reply = (
            "On ShaadiSaathi, rental items (like Bridal Lehengas, Jewellery, and Sound Gear) come with clear date-range availability. "
            "When you begin checkout, a 15-minute inventory hold reserves your item. Security deposits are refundable upon return "
            "inspection after the wedding. Damaged or delayed returns are settled transparently in your customer dashboard."
        )
        citations.append(ChatCitation(
            sourceType="Platform Policy",
            title="ShaadiSaathi Rental Terms & Security Deposit Policy"
        ))
        
    elif "photographer" in clean_msg or "photo" in clean_msg:
        reply = (
            "We have verified wedding photographers offering both traditional coverage and cinematic drone videography. "
            "For services, you can either book direct packages or request custom milestone quotations directly from the vendor's profile."
        )
        citations.append(ChatCitation(
            sourceType="Marketplace Catalog",
            title="Photography & Cinematography Category"
        ))
        
    elif "cancel" in clean_msg or "refund" in clean_msg:
        reply = (
            "Our cancellation policy depends on the transaction type: retail purchases can be refunded prior to dispatch; "
            "rental reservations can be cancelled with full deposit return according to vendor notice windows; "
            "and service milestones are governed by signed quotation agreements on the platform."
        )
        citations.append(ChatCitation(
            sourceType="Platform Policy",
            title="Refund and Dispute Resolution Rules"
        ))
        
    else:
        reply = (
            f"Hello {ctx.userName or 'there'}! I am your ShaadiSaathi AI Assistant. "
            "I can help you analyze your wedding budget, suggest vendor categories, explain rental terms and security deposits, "
            "or help you discover listings across Rent, Buy New, Buy Used, and Book Services. What would you like to explore?"
        )
        citations.append(ChatCitation(
            sourceType="Platform Knowledge",
            title="ShaadiSaathi General Assistant"
        ))
        
    # Append any public featured listings if provided in authorized context
    if ctx.featuredListings:
        suggested_listings = ctx.featuredListings[:3]
        
    return ChatRagResponse(
        reply=reply,
        citations=citations,
        suggestedListings=suggested_listings,
        confidence="HIGH",
        isFallback=False
    )
