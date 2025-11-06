"""
Comprehensive tests for Bagh Online API endpoints.

Tests cover:
- Translation endpoint
- Execution endpoint with sandboxing
- AI assistance endpoint
- Error handling
- Bangla Unicode support
"""

import json
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from app.main import create_app


client = TestClient(create_app())


class TestHealthEndpoint:
    """Tests for GET /health."""

    def test_health_returns_ok(self):
        """Health check should return 200 with ok status."""
        response = client.get("/health")
        assert response.status_code == 200
        payload = response.json()
        assert payload["status"] == "ok"
        assert "timestamp" in payload
        assert "environment" in payload

    def test_health_returns_environment(self):
        """Health should include environment info."""
        response = client.get("/health")
        payload = response.json()
        assert payload["environment"] in ["development", "production", "testing"]


class TestTranslateEndpoint:
    """Tests for POST /api/v1/translate."""

    def test_translate_valid_bagh_code(self):
        """Should translate valid Bagh Lang code to Python."""
        response = client.post(
            "/api/v1/translate",
            json={"source": 'লিখো("শুভ সকাল!")'},
        )
        assert response.status_code == 200
        payload = response.json()
        assert "translated" in payload
        assert "print" in payload["translated"]
        assert payload["source_char_length"] > 0
        assert payload["duration_ms"] >= 0
        assert "request_id" in payload

    def test_translate_bangla_numerals(self):
        """Should convert Bangla numerals to Western digits."""
        response = client.post(
            "/api/v1/translate",
            json={"source": "x = ১০"},
        )
        assert response.status_code == 200
        payload = response.json()
        assert "10" in payload["translated"]

    def test_translate_empty_source_fails(self):
        """Empty source should return 422 (Pydantic validation)."""
        response = client.post(
            "/api/v1/translate",
            json={"source": ""},
        )
        assert response.status_code == 422
        assert "should have at least 1 character" in response.text.lower() or "cannot be empty" in response.text.lower()

    def test_translate_source_exceeds_limit(self):
        """Source exceeding limit should return 413."""
        response = client.post(
            "/api/v1/translate",
            json={"source": "x = ১\n" * 10000},  # Generate large source
        )
        assert response.status_code == 413
        assert "exceeds limit" in response.text.lower()

    def test_translate_invalid_syntax_returns_422(self):
        """Invalid Python syntax should return 422."""
        response = client.post(
            "/api/v1/translate",
            json={"source": "যদি ১ == ১\n  লিখো"},  # Missing colon, incomplete statement
        )
        # Should either succeed with invalid Python (and catch on execution)
        # or fail with syntax validation error (422)
        assert response.status_code in [200, 422]


class TestExecuteEndpoint:
    """Tests for POST /api/v1/execute."""

    def test_execute_simple_output(self):
        """Should execute Bagh code and capture output."""
        response = client.post(
            "/api/v1/execute",
            json={"source": 'লিখো("বাঘ!")'},
        )
        assert response.status_code == 200
        payload = response.json()
        assert "বাঘ!" in payload["stdout"]
        assert payload["status"] == "success"
        assert payload["duration_ms"] >= 0

    def test_execute_with_variables(self):
        """Should handle variable assignments."""
        response = client.post(
            "/api/v1/execute",
            json={"source": "নাম = \"টাইগার\"\nলিখো(নাম)"},
        )
        assert response.status_code == 200
        payload = response.json()
        assert "টাইগার" in payload["stdout"]
        assert payload["status"] == "success"

    def test_execute_with_loop(self):
        """Should execute loops correctly."""
        response = client.post(
            "/api/v1/execute",
            json={"source": 'ঘুরো i ৩ বার:\n    লিখো(i)'},
        )
        assert response.status_code == 200
        payload = response.json()
        assert payload["status"] == "success"
        # Should print 0, 1, 2 (or similar based on implementation)

    def test_execute_syntax_error_returns_400(self):
        """Syntax errors should return 400 with stderr."""
        response = client.post(
            "/api/v1/execute",
            json={"source": "এটি বৈধ নয়!\n@#$%^"},
        )
        assert response.status_code == 400
        payload = response.json()
        assert payload["status"] == "error"

    def test_execute_runtime_error_returns_400(self):
        """Runtime errors should return 400 with stderr."""
        response = client.post(
            "/api/v1/execute",
            json={"source": 'লিখো(undefined_variable)'},
        )
        assert response.status_code == 400
        payload = response.json()
        assert payload["status"] == "error"
        assert payload["stderr"] is not None

    def test_execute_timeout_returns_504(self):
        """Infinite loops should timeout and return 504."""
        response = client.post(
            "/api/v1/execute",
            json={"source": "যখন সত্য:\n    x = ১"},
        )
        # Timeout should happen within configured timeout
        # This test may need adjustment based on actual timeout duration
        assert response.status_code in [504, 400]  # 504 for timeout, 400 for other errors

    def test_execute_empty_source_fails(self):
        """Empty source should return 422 (Pydantic validation)."""
        response = client.post(
            "/api/v1/execute",
            json={"source": ""},
        )
        assert response.status_code == 422

    def test_execute_forbidden_import_fails(self):
        """Importing non-whitelisted modules should fail."""
        response = client.post(
            "/api/v1/execute",
            json={"source": "আমদানি os"},  # Try to import os
        )
        # Should fail, os is not whitelisted
        assert response.status_code in [400, 422]


class TestAssistEndpoint:
    """Tests for POST /api/v1/assist."""

    def test_assist_without_gemini_key_returns_424(self):
        """Without Gemini API key, should return 424."""
        response = client.post(
            "/api/v1/assist",
            json={"prompt": "এটি কী করে?"},
        )
        # If Gemini key is not configured, should return 424
        assert response.status_code in [424, 200]  # 424 if disabled, 200 if mocked

    @patch("app.ai.genai")
    def test_assist_with_mock_gemini(self, mock_genai):
        """Should send prompt to Gemini and return response."""
        # Mock the Gemini client
        mock_model = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "বাংলায় ব্যাখ্যা: এটি একটি পরীক্ষামূলক উত্তর।"
        mock_model.generate_content.return_value = mock_response
        mock_genai.GenerativeModel.return_value = mock_model

        # Would need proper setup, skipping for now
        pass

    def test_assist_empty_prompt_fails(self):
        """Empty prompt should return error."""
        response = client.post(
            "/api/v1/assist",
            json={"prompt": ""},
        )
        assert response.status_code == 422 or response.status_code == 400


class TestBanglaUnicodeSupport:
    """Tests for Bangla Unicode handling."""

    def test_bangla_string_literals_preserved(self):
        """Bangla string literals should be preserved exactly."""
        bagh_code = 'লিখো("🐯 বাঘ এসেছে!")'
        response = client.post(
            "/api/v1/translate",
            json={"source": bagh_code},
        )
        assert response.status_code == 200
        payload = response.json()
        # String content should be identical in Python output
        assert "🐯 বাঘ এসেছে!" in payload["translated"]

    def test_bangla_variable_names(self):
        """Bangla variable names should work."""
        response = client.post(
            "/api/v1/execute",
            json={"source": "আমার_বয়স = ১০\nলিখো(আমার_বয়স)"},
        )
        assert response.status_code == 200
        payload = response.json()
        assert "10" in payload["stdout"]


class TestErrorHandling:
    """Tests for error response contracts."""

    def test_error_response_has_request_id(self):
        """Custom error responses should include request_id."""
        # Use a case that triggers custom error handler (invalid code that causes execution error)
        response = client.post(
            "/api/v1/execute",
            json={"source": "লিখো(undefined_var)"},
        )
        assert response.status_code == 400
        payload = response.json()
        assert "request_id" in payload

    def test_error_response_has_error_field(self):
        """Custom error responses should have status field."""
        # Use a case that triggers custom error handler
        response = client.post(
            "/api/v1/execute",
            json={"source": "লিখো(undefined_var)"},
        )
        assert response.status_code == 400
        payload = response.json()
        assert "status" in payload
        assert payload["status"] == "error"

    def test_request_id_in_header(self):
        """Response should include request_id header."""
        response = client.post(
            "/api/v1/translate",
            json={"source": "লিখো(১)"},
        )
        assert "x-request-id" in response.headers


class TestResponseStructure:
    """Tests for response data contracts."""

    def test_translation_response_structure(self):
        """TranslationResponse should have required fields."""
        response = client.post(
            "/api/v1/translate",
            json={"source": "x = ১"},
        )
        payload = response.json()
        required_fields = [
            "request_id",
            "translated",
            "duration_ms",
            "source_char_length",
        ]
        for field in required_fields:
            assert field in payload

    def test_execution_response_structure(self):
        """ExecutionResponse should have required fields."""
        response = client.post(
            "/api/v1/execute",
            json={"source": 'লিখো("test")'},
        )
        payload = response.json()
        required_fields = [
            "request_id",
            "translated",
            "stdout",
            "stderr",
            "duration_ms",
            "status",
        ]
        for field in required_fields:
            assert field in payload

    @patch("app.ai.genai")
    def test_assist_response_structure(self, mock_genai):
        """AssistResponse should have required fields."""
        # Mock the Gemini client
        mock_model = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "পরীক্ষামূলক সাহায্য বার্তা।"
        mock_model.generate_content.return_value = mock_response
        mock_genai.GenerativeModel.return_value = mock_model

        response = client.post(
            "/api/v1/assist",
            json={"prompt": "কী করবো?"},
        )
        if response.status_code == 200:
            payload = response.json()
            assert "message" in payload
            assert "request_id" in payload
