def test_health_check_public_access(client):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "modelsLoaded" in data

def test_protected_endpoint_rejects_missing_key(client):
    payload = {
        "city": "Delhi NCR",
        "guestCount": 350,
        "functionCount": 3,
        "venueType": "banquet_hall",
        "cateringPreference": "standard_nonveg",
        "decorationLevel": "traditional",
        "photographyPackage": "cinematic_drone",
        "eventDurationDays": 2
    }
    res = client.post("/predict/wedding-budget", json=payload)
    assert res.status_code == 401

def test_protected_endpoint_rejects_invalid_key(client):
    payload = {
        "city": "Delhi NCR",
        "guestCount": 350
    }
    res = client.post(
        "/predict/wedding-budget",
        json=payload,
        headers={"X-Internal-Service-Key": "invalid_fraudulent_key"}
    )
    assert res.status_code == 401
