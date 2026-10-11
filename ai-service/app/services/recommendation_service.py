from typing import List
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    RecommendationItem
)

def rank_vendor_listings(req: RecommendationRequest) -> RecommendationResponse:
    """
    Ranks marketplace listings using transparent multi-factor scoring:
    - Availability filter (Must be verified available)
    - City proximity (High weight for local vendor, or pan-India rental items)
    - Budget compatibility (Evaluates listing price relative to target budget)
    - Quality signals (Rating, review volume)
    - Category & Transaction Type alignment
    """
    scored_items: List[RecommendationItem] = []
    target_city = req.city.strip().lower()
    pref_cats = [c.lower() for c in (req.categories or [])]
    
    for item in req.availableListings:
        # Mandatory hard filter: availability
        if not item.isAvailable:
            continue
            
        score = 0.0
        reasons = []
        
        # 1. City / Location Match (Max 30 pts)
        item_city = item.city.strip().lower()
        if item_city == target_city or "all india" in item_city or "pan india" in item_city:
            score += 30.0
            reasons.append(f"Located in your wedding city ({item.city})")
        elif "delhi" in item_city and "delhi" in target_city:
            score += 25.0
            reasons.append("Servicing Delhi NCR region")
        else:
            score += 10.0
            
        # 2. Budget Compatibility (Max 30 pts)
        if item.price <= req.budget:
            # Price is within budget
            price_ratio = item.price / req.budget
            if 0.1 <= price_ratio <= 0.8:
                score += 30.0
                reasons.append(f"Great budget fit at ₹{item.price:,.0f}")
            else:
                score += 20.0
                reasons.append(f"Budget compatible (₹{item.price:,.0f})")
        else:
            # Over budget, penalize based on margin
            overage = (item.price - req.budget) / req.budget
            if overage < 0.2:
                score += 10.0
                reasons.append("Slightly above target budget but premium tier")
            else:
                score += 2.0
                
        # 3. Category & Transaction Type Match (Max 25 pts)
        item_cat = item.category.strip().lower()
        if pref_cats and any(cat in item_cat for cat in pref_cats):
            score += 20.0
            reasons.append(f"Matches preferred category: {item.category}")
        elif not pref_cats:
            score += 15.0
            
        if req.transactionType and item.transactionType.lower() == req.transactionType.lower():
            score += 5.0
            reasons.append(f"Preferred transaction format: {item.transactionType.upper()}")
            
        # 4. Rating & Review Score (Max 15 pts)
        if item.rating > 0:
            rating_pts = min(12.0, item.rating * 2.4)
            review_bonus = min(3.0, (item.reviewCount / 10.0) * 3.0)
            score += (rating_pts + review_bonus)
            if item.rating >= 4.5:
                reasons.append(f"Highly rated by couples ({item.rating:.1f} ★)")
        else:
            # Cold-start handling for newly registered vendors
            score += 8.0
            reasons.append("Newly verified marketplace partner")
            
        # Determine badge
        badge = None
        if score >= 85:
            badge = "Top Match"
        elif item.rating >= 4.8 and item.reviewCount >= 5:
            badge = "Customer Favorite"
        elif item.price < (req.budget * 0.4):
            badge = "Best Value"
            
        match_percentage = min(99, max(45, int(score)))
        
        scored_items.append(
            RecommendationItem(
                listingId=item.id,
                title=item.title,
                category=item.category,
                transactionType=item.transactionType,
                price=item.price,
                score=round(score, 1),
                matchPercentage=match_percentage,
                reasons=reasons,
                badge=badge
            )
        )
        
    # Sort descending by score
    scored_items.sort(key=lambda x: x.score, reverse=True)
    
    return RecommendationResponse(
        totalEvaluated=len(req.availableListings),
        recommendations=scored_items[:12],
        appliedFilters={
            "city": req.city,
            "budget": req.budget,
            "categories": req.categories or "All",
            "transactionType": req.transactionType or "All"
        },
        explanation="Recommendations ranked based on city proximity, date availability, budget alignment, and authentic customer ratings."
    )
