def test_budget_prediction_valid_input(client, auth_headers):
    payload = {
        "city": "Jaipur",
        "guestCount": 400,
        "functionCount": 3,
        "venueType": "palace",
        "cateringPreference": "premium_gourmet",
        "decorationLevel": "royal_luxury",
        "photographyPackage": "cinematic_drone",
        "eventDurationDays": 2
    }
    res = client.post("/predict/wedding-budget", json=payload, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["estimatedAmount"] > 0
    assert data["lowerBound"] < data["estimatedAmount"]
    assert data["upperBound"] > data["estimatedAmount"]
    assert data["currency"] == "INR"
    assert "breakdown" in data
    assert data["breakdown"]["venueAndCatering"] > 0
    assert data["isSyntheticData"] is True

def test_budget_prediction_invalid_guest_count_rejected(client, auth_headers):
    payload = {
        "city": "Jaipur",
        "guestCount": 5, # Below minimum 10
        "functionCount": 2
    }
    res = client.post("/predict/wedding-budget", json=payload, headers=auth_headers)
    assert res.status_code == 422 # Pydantic Validation Error
