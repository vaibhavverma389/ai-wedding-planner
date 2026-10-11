def test_vendor_recommendations_filters_and_ranks(client, auth_headers):
    payload = {
        "budget": 50000.0,
        "city": "Delhi NCR",
        "categories": ["Bridal & Groom Wear"],
        "transactionType": "rent",
        "availableListings": [
            {
                "id": "item-1",
                "title": "Sabyasachi Heritage Crimson Lehenga",
                "category": "Bridal & Groom Wear",
                "transactionType": "rent",
                "price": 35000.0,
                "city": "Delhi NCR",
                "rating": 4.9,
                "reviewCount": 18,
                "isAvailable": True
            },
            {
                "id": "item-2",
                "title": "Unavailable Heavy Sherwani",
                "category": "Bridal & Groom Wear",
                "transactionType": "rent",
                "price": 25000.0,
                "city": "Delhi NCR",
                "rating": 4.5,
                "reviewCount": 10,
                "isAvailable": False # Must be filtered out
            },
            {
                "id": "item-3",
                "title": "Mumbai Gold Set",
                "category": "Jewellery",
                "transactionType": "rent",
                "price": 90000.0, # Over budget
                "city": "Mumbai", # Different city
                "rating": 4.0,
                "reviewCount": 2,
                "isAvailable": True
            }
        ]
    }
    res = client.post("/recommendations/vendors", json=payload, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["totalEvaluated"] == 3
    # item-2 should be excluded because isAvailable is False
    assert len(data["recommendations"]) == 2
    top_item = data["recommendations"][0]
    assert top_item["listingId"] == "item-1"
    assert top_item["score"] > data["recommendations"][1]["score"]
    assert "Delhi NCR" in top_item["reasons"][0]
