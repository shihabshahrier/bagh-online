import json
from unittest.mock import patch
from fastapi.testclient import TestClient

from app.main import create_app


client = TestClient(create_app())


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert "timestamp" in payload


def test_translate_endpoint():
    response = client.post(
        "/api/v1/translate",
        json={"source": 'লিখো("🐯 বাঘ এসেছে!")'},
    )
    assert response.status_code == 200
    payload = response.json()
    assert "print" in payload["translated"]
    assert payload["source_char_length"] > 0


def test_execute_endpoint_success():
    response = client.post(
        "/api/v1/execute",
        json={"source": 'লিখো("Hi")'},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "success"
    assert payload["stdout"].strip() == "Hi"


def test_assist_endpoint_without_gemini_key():
    """Test that assist endpoint returns 424 when Gemini is unavailable."""
    # Create a new app instance with mocked settings (no API key)
    with patch('app.main.get_settings') as mock_settings:
        # Mock settings to have no Gemini key
        settings = mock_settings.return_value
        settings.gemini_api_key = ""
        settings.app_name = "Test"
        settings.app_version = "0.1.0"
        settings.environment = "testing"
        settings.log_level = "INFO"
        settings.api_prefix = "/api"
        settings.api_host = "0.0.0.0"
        settings.api_port = 8000
        settings.cors_allow_origins = ["*"]
        settings.cors_allow_credentials = True
        settings.sandbox_timeout_seconds = 3.0
        settings.sandbox_max_concurrency = 4
        settings.sandbox_max_output_chars = 5000
        settings.sandbox_max_source_chars = 6000
        settings.gemini_model = "gemini-2.5-flash"
        settings.gemini_temperature = 0.4
        settings.gemini_top_p = 0.9
        settings.gemini_top_k = 40
        settings.gemini_max_output_tokens = 512
        
        test_client = TestClient(create_app())
        response = test_client.post("/api/v1/assist", json={"prompt": "Hello"})
        
        # Should return 424 when Gemini is unavailable
        assert response.status_code == 424
        payload = response.json()
        assert payload["error"] == "Gemini unavailable"
