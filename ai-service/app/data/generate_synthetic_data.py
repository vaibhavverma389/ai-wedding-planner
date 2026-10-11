"""
Synthetic Wedding Budget Dataset Generator
Provenance: ShaadiSaathi AI Research (Documented Synthetic Benchmark)
Generates 1,000 realistic Indian wedding expense records based on industry domain multipliers across Tier-1/Tier-2 cities, guest scales, venue tiers, and decor packages.
"""

import os
import random
import pandas as pd
import numpy as np

def generate_dataset(num_records: int = 1000, output_path: str = None) -> pd.DataFrame:
    random.seed(42)
    np.random.seed(42)
    
    cities = ["delhi ncr", "mumbai", "bengaluru", "jaipur", "hyderabad", "kolkata", "pune", "lucknow", "chennai", "goa"]
    city_weights = [0.22, 0.20, 0.12, 0.14, 0.08, 0.06, 0.06, 0.04, 0.04, 0.04]
    
    city_multipliers = {
        "mumbai": 1.45, "delhi ncr": 1.40, "bengaluru": 1.30, "jaipur": 1.35,
        "hyderabad": 1.25, "kolkata": 1.15, "pune": 1.20, "lucknow": 1.10,
        "chennai": 1.15, "goa": 1.50
    }
    
    venue_types = ["community_hall", "farmhouse", "banquet_hall", "luxury_hotel", "palace"]
    venue_costs = {"community_hall": 150000, "farmhouse": 450000, "banquet_hall": 650000, "luxury_hotel": 1600000, "palace": 3500000}
    
    catering_prefs = ["pure_veg", "standard_nonveg", "premium_gourmet"]
    catering_costs = {"pure_veg": 1200, "standard_nonveg": 1800, "premium_gourmet": 2800}
    
    decor_levels = ["minimal", "traditional", "royal_luxury"]
    decor_costs = {"minimal": 150000, "traditional": 350000, "royal_luxury": 950000}
    
    photo_packages = ["basic_candid", "cinematic_drone", "celebrity_tier"]
    photo_costs = {"basic_candid": 120000, "cinematic_drone": 280000, "celebrity_tier": 650000}
    
    records = []
    for _ in range(num_records):
        city = random.choices(cities, weights=city_weights)[0]
        guest_count = int(np.random.choice([150, 250, 400, 600, 800, 1200, 1800], p=[0.15, 0.25, 0.25, 0.15, 0.10, 0.07, 0.03]))
        guest_count += random.randint(-25, 25)
        guest_count = max(50, guest_count)
        
        function_count = random.choices([2, 3, 4, 5], weights=[0.2, 0.45, 0.25, 0.1])[0]
        event_duration_days = max(1, min(function_count, random.choices([1, 2, 3], weights=[0.3, 0.5, 0.2])[0]))
        
        venue_type = random.choice(venue_types)
        catering_pref = random.choice(catering_prefs)
        decor_level = random.choice(decor_levels)
        photo_pkg = random.choice(photo_packages)
        
        # Calculate synthetic ground truth expense with realistic variance (noise: +/- 8%)
        c_mult = city_multipliers[city]
        venue_base = venue_costs[venue_type] * event_duration_days * 0.75
        catering_total = catering_costs[catering_pref] * guest_count * function_count * 0.65
        decor_total = decor_costs[decor_level] * function_count * 0.8
        photo_total = photo_costs[photo_pkg] * (1 + (event_duration_days - 1) * 0.4)
        attire_jewellery = max(200000, (catering_total + venue_base) * 0.18)
        entertainment_misc = max(100000, (decor_total + photo_total) * 0.15)
        
        deterministic_sum = (venue_base + catering_total + decor_total + photo_total + attire_jewellery + entertainment_misc) * c_mult
        noise = np.random.normal(1.0, 0.07)
        total_expense = round(deterministic_sum * noise, -3)
        
        records.append({
            "city": city,
            "guest_count": guest_count,
            "function_count": function_count,
            "venue_type": venue_type,
            "catering_preference": catering_pref,
            "decoration_level": decor_level,
            "photography_package": photo_pkg,
            "event_duration_days": event_duration_days,
            "actual_expense": total_expense
        })
        
    df = pd.DataFrame(records)
    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        df.to_csv(output_path, index=False)
        print(f"✅ Generated {len(df)} synthetic records and saved to {output_path}")
    return df

if __name__ == "__main__":
    out = os.path.join(os.path.dirname(__file__), "wedding_budget_dataset.csv")
    generate_dataset(1000, out)
