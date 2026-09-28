package httpapi

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealthContract(t *testing.T) {
	w := httptest.NewRecorder()
	NewHandler().ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/api/v1/health", nil))
	if w.Code != http.StatusOK || w.Header().Get("Content-Type") != "application/json" || w.Header().Get("Cache-Control") != "no-store" {
		t.Fatalf("unexpected response: %v", w.Result())
	}
	var body map[string]string
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if len(body) != 3 || body["status"] != "ok" || body["service"] != "controller" || body["api_version"] != "v1" {
		t.Fatalf("unexpected body: %v", body)
	}
}

func TestUnsupportedRequests(t *testing.T) {
	for _, tt := range []struct {
		method, path string
		status       int
	}{
		{"POST", "/api/v1/health", 405},
		{"GET", "/api/v1/nodes", 404},
		{"GET", "/api/v1/health/extra", 404},
	} {
		w := httptest.NewRecorder()
		NewHandler().ServeHTTP(w, httptest.NewRequest(tt.method, tt.path, nil))
		if w.Code != tt.status {
			t.Errorf("%s %s: got %d, want %d", tt.method, tt.path, w.Code, tt.status)
		}
	}
}
