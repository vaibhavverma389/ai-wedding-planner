from typing import List
from app.schemas.planner import (
    PlannerRequest,
    PlannerResponse,
    TimelineMilestone,
    FunctionBudgetAllocation,
    ChecklistTask,
    SavingSuggestion
)

def generate_personalized_wedding_plan(req: PlannerRequest) -> PlannerResponse:
    """
    Generates a personalized, function-wise Indian wedding planning blueprint,
    budget allocation, preparation timeline, and prioritized checklist.
    """
    budget = req.totalBudget
    
    # 1. Timeline Milestones
    timeline = [
        TimelineMilestone(
            monthRange="9 - 12 Months Out",
            phase="Vision, Budget & Core Venue Booking",
            keyActions=[
                f"Lock total budget of ₹{budget:,.0f} and finalize guest list target ({req.guestCount} guests).",
                f"Shortlist and book primary wedding & reception venue in {req.city}.",
                "Book high-demand wedding photographer and cinematographer.",
                "Shortlist bridal lehenga & groom sherwani designers or rental specialists."
            ]
        ),
        TimelineMilestone(
            monthRange="6 - 8 Months Out",
            phase="Vendor Locking & Function Design",
            keyActions=[
                "Confirm wedding caterer, menu tasting sessions, and bar/mocktail packages.",
                "Finalize theme decor concepts for Mehendi, Sangeet, and Mandap.",
                "Book Bridal Mehndi artist and Makeup/Hair stylist.",
                "Send digital Save-the-Dates to out-of-town guests."
            ]
        ),
        TimelineMilestone(
            monthRange="3 - 5 Months Out",
            phase="Wardrobe, Logistics & Invitations",
            keyActions=[
                "Complete wedding wardrobe fittings, jewellery rentals, and safa/turban orders.",
                "Book Sound, DJ setup, and choreographers for the Sangeet ceremony.",
                "Finalize guest accommodations and airport/railway transfer logistics.",
                "Dispatch formal wedding invitations and open digital RSVP links."
            ]
        ),
        TimelineMilestone(
            monthRange="1 - 2 Months Out",
            phase="Final Rehearsals & Settlement Prep",
            keyActions=[
                "Confirm finalized RSVP count and lock plate minimums with caterer.",
                "Conduct final hair/makeup trial and bridal henna consultation.",
                "Assemble wedding welcome hampers, favours, and token gifts.",
                "Review ShaadiSaathi security deposits, rental return terms, and payment schedules."
            ]
        ),
        TimelineMilestone(
            monthRange="Wedding Week",
            phase="Celebration Execution & Family Coordination",
            keyActions=[
                "Designate point-of-contact family members for vendor arrivals.",
                "Inspect sound and light production 4 hours before Sangeet kickoff.",
                "Verify return packaging and tags for rented bridal jewellery and sherwanis.",
                "Relax and celebrate stress-free with family and friends!"
            ]
        )
    ]
    
    # 2. Function-wise Budget Allocation
    function_weights = {
        "Wedding & Pheras": (0.35, ["Banquets & Farmhouses", "Decor & Floral Setup", "Bridal & Groom Wear", "Sound & DJ Setup"]),
        "Reception Dinner": (0.25, ["Banquets & Farmhouses", "Decor & Floral Setup", "Sound & DJ Setup"]),
        "Sangeet & Cocktail": (0.18, ["Sound & DJ Setup", "Decor & Floral Setup", "Bridal & Groom Wear"]),
        "Mehendi & Haldi": (0.12, ["Mehndi & Makeup Artists", "Decor & Floral Setup", "Sound & DJ Setup"]),
        "Pre-Wedding / Media": (0.10, ["Photography & Cinematography", "Jewellery"])
    }
    
    function_budget: List[FunctionBudgetAllocation] = []
    for func_name, (weight, cats) in function_weights.items():
        allocated_amt = round(budget * weight, -2)
        function_budget.append(
            FunctionBudgetAllocation(
                functionName=func_name,
                allocatedPercentage=round(weight * 100, 1),
                allocatedAmount=allocated_amt,
                suggestedCategories=cats
            )
        )
        
    # 3. Prioritized Checklist
    checklist = [
        ChecklistTask(category="Venue", title="Sign contract & deposit for main Mandap venue", priority="HIGH", timelinePhase="12-9 Months"),
        ChecklistTask(category="Photography", title="Lock 2-day candid photo + cinematic video package", priority="HIGH", timelinePhase="12-9 Months"),
        ChecklistTask(category="Decor", title="Finalize floral mandap and stage backdrop 3D renders", priority="HIGH", timelinePhase="6-8 Months"),
        ChecklistTask(category="Catering", title="Menu tasting session with 4 live counters selected", priority="HIGH", timelinePhase="6-8 Months"),
        ChecklistTask(category="Jewellery", title="Reserve Polki/Kundan bridal jewellery set on rental", priority="MEDIUM", timelinePhase="3-5 Months"),
        ChecklistTask(category="Sound & DJ", title="Confirm DJ song cue list for bridal entry & Sangeet", priority="MEDIUM", timelinePhase="3-5 Months"),
        ChecklistTask(category="Wardrobe", title="Complete groom sherwani trial and safa color matching", priority="MEDIUM", timelinePhase="1-2 Months"),
        ChecklistTask(category="RSVP", title="Reconcile confirmed attendees in ShaadiSaathi Guest Manager", priority="HIGH", timelinePhase="1-2 Months")
    ]
    
    # 4. Budget-Saving Suggestions
    saving_tips = [
        SavingSuggestion(
            area="Bridal & Groom Wear",
            recommendation="Opt to rent high-end Sabyasachi/Manish Malhotra style bridal lehengas and groom sherwanis instead of buying new.",
            potentialSavingsEstimate="Save ₹1,50,000 – ₹3,00,000 (up to 75% off retail purchase)"
        ),
        SavingSuggestion(
            area="Floral & Stage Decor",
            recommendation="Blend seasonal local blooms (Marigold, Jasmine, Rajnigandha) with reusable silk florals for day functions like Haldi and Mehendi.",
            potentialSavingsEstimate="Save ₹60,000 – ₹1,20,000 on imported flowers"
        ),
        SavingSuggestion(
            area="Catering Plate Count",
            recommendation="Base caterer guarantees on 80% of total invites with a 10% on-the-spot buffer rather than 100% headcount.",
            potentialSavingsEstimate="Save ₹80,000 – ₹1,80,000 on uneaten buffet waste"
        ),
        SavingSuggestion(
            area="Pre-Owned Equipment & Used Decor",
            recommendation="Explore verified pre-owned photo gear, entry walkway props, and artificial varmalas on ShaadiSaathi marketplace.",
            potentialSavingsEstimate="Save ₹30,000 – ₹60,000"
        )
    ]
    
    recommended_cats = [
        "Banquets & Farmhouses",
        "Decor & Floral Setup",
        "Photography & Cinematography",
        "Bridal & Groom Wear",
        "Mehndi & Makeup Artists",
        "Jewellery",
        "Sound & DJ Setup"
    ]
    
    return PlannerResponse(
        planTitle=f"Grand {req.city} Wedding Master Plan",
        totalBudget=budget,
        city=req.city,
        guestCount=req.guestCount,
        timeline=timeline,
        functionBudget=function_budget,
        checklist=checklist,
        budgetSavingTips=saving_tips,
        recommendedMarketplaceCategories=recommended_cats,
        disclaimer="ShaadiSaathi AI plans are advisory blueprints structured around Indian wedding ceremonies. Vendor bookings, availability holds, and payment transactions must be completed directly via marketplace listings."
    )
